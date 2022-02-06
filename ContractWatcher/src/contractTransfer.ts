import { Contract } from "web3-eth-contract"
import Web3 from 'web3';
import { TransferEvents } from "./addEventsToDatabase"

const client = require('node-rest-client-promise').Client();

const etherscan_url_base = "http://api.etherscan.io/api?module=contract&action=getabi"

let LATESTBLOCK: undefined | number = undefined

interface BlockObject {
    startBlock: number;
    endBlock: number;
}

/**
 * This function will get the contracts ABI, needed down the road.
 * @param contractAddress - The address of the contract you want to get events for
 * @param etherScanApiKey - Your API key for Etherscan
 * @returns - The contract ABI
 */
async function getContractAbi(contractAddress: string, etherScanApiKey: string): Promise<any> {
    const etherescan_url = `${etherscan_url_base}&address=${contractAddress}&apikey=${etherScanApiKey}`
    console.log(`Getting contract ABI for: ${contractAddress}`)
    const etherescan_response = await client.getPromise(etherescan_url)
    const contractAbi = JSON.parse(etherescan_response.data.result);
    return contractAbi;
}

/**
 * This function will create a 'contract' object, which will be used to get events
 * @param contractAddress - The address of the contract you want to get events for
 * @param etherScanApiKey - Your API key for Etherscan
 * @param infuraKey - Your infuraKey
 * @returns  - The contract object
 */
async function createContract(contractAddress: string, etherScanApiKey: string, infuraKey: string): Promise<Contract> {
    const options = {
        // Enable auto reconnection
        reconnect: {
            auto: true,
            delay: 5000, // ms
            maxAttempts: 10000000,
            onTimeout: true
        },
        maxReceivedFrameSize: 10000000000,
        maxReceivedMessageSize: 10000000000
    };
    const contractAbi = await getContractAbi(contractAddress, etherScanApiKey);
    var web3 = new Web3(new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws/v3/' + infuraKey, options))
    const contract = new web3.eth.Contract(contractAbi, contractAddress);
    return contract
}

/**
 * Helper function which properly parses the return from Web3 and gets the desired values
 * @param event - The returned events
 * @returns {object}  - The desired values
 */
function filterEvents(event: any): object {
    const picked = (({ address, transactionHash, blockNumber, returnValues: { from, to, tokenId } }) => (
        {
            transactionHash: transactionHash.toLowerCase(), "contractAddress": address.toLowerCase(),
            "blockNumber": parseInt(blockNumber), "tokenId": parseInt(tokenId),
            "fromAddress": from.toLowerCase(), "toAddress": to.toLowerCase()
        }
    ))(event);
    return picked
}

let LASTTRANSCATION: string | undefined;
/**
 * This function will query new events on the smart contract, and add them to the DB.
 * @param contract - Web3 contract object
 * @param connectionName - A string specifying the connection name that should be used.
 * @param checkDuplicates - A boolean highlighting if the duplicates should be checked for
 */
function insertNewEventsToDb(contract: Contract, connectionName: string, checkDuplicates: boolean): void {
    contract.events.Transfer()
        .on('data', async (event: any) => {
            if (LATESTBLOCK === undefined) {
                LATESTBLOCK = event.blockNumber
            }

            if (LASTTRANSCATION !== event.transactionHash) {
                LASTTRANSCATION = event.transactionHash
                console.log("Found a new event - transactionHash:", event.transactionHash)
                let TransferEvent = new TransferEvents()
                let doesExist: boolean | undefined
                if (checkDuplicates) {
                    doesExist = await TransferEvent.DoesTransactionExist(event.transactionHash, connectionName)
                    console.log("Is this a duplicate: ", doesExist)
                }
                if (doesExist === false || doesExist === undefined) {
                    TransferEvent.InsertTransferEvents(filterEvents(event), connectionName)
                } else {
                    console.warn(`Skipping ${event.transactionHash} because its already in the DB`)
                }
            }
        })
        .on('error', console.error);
    setTimeout(function () {
        insertNewEventsToDb(contract, connectionName, checkDuplicates)
    }, 500)
}

/**
 * - Helper function, if user provides, latest or earliest as block ranges, it turns it into a number.
 * @param startBlock
 * @param endBlock
 * @param contractStartBlock
 * @returns
 */
function blockRange(startBlock: number | string, endBlock: number | string, contractStartBlock: number): number[] {
    let newEndBlock: any //Actually only a number but this hack is needed
    let newStartBlock: any //Actually only a number but this hack is needed
    if (endBlock === "latest") {
        newEndBlock = LATESTBLOCK
    } else {
        newEndBlock = endBlock
    }
    if (startBlock === "earliest") {
        newStartBlock = contractStartBlock
    } else {
        newStartBlock = startBlock
    }
    return [newStartBlock, newEndBlock]
}
/**
 * You can't query for more than 10,000 events at once. Therefore this function will take the start
 * and end block number, and return an object which will highlight the increments for querying.
 * EX: startBlock: 0, endBlock: 20000 - This will return two objects indicating that the first
 * Query should occur as form 0 - 10000, and the second should be 10,000 -> 20,000
 * @param startBlock
 * @param endBlock
 * @param delimeter
 * @returns
 */
function createBlockArray(startBlock: number, endBlock: number, delimeter = 10000): Array<BlockObject> {
    let blockArray: Array<BlockObject> = [];
    let tempStart: number = startBlock
    while (endBlock - tempStart > delimeter) {
        blockArray.push({
            "startBlock": tempStart,
            "endBlock": tempStart + delimeter
        })
        tempStart += delimeter
    }
    blockArray.push({
        "startBlock": tempStart,
        "endBlock": endBlock
    })

    return blockArray
}

/**
 * This function will get all the events from the start to end block, format the events, and insert them into
 * the database.
 * @param contract - Web3 contract object
 * @param startBlock - The block to start at, either provide a number or "earliest"
 * @param endBlock - The block to end at, either provide a number or "latest"
 * @param pastEventConnectionName - A string specifying the connection name that should be used.
 * @param checkDuplicates - A boolean highlighting if the duplicates should be checked for
 * @returns
 */
function insertPastEventsToDb(contract: Contract, startBlock: number | string,
    endBlock: number | string, pastEventConnectionName: string, checkDuplicates: boolean): void {
    contract.getPastEvents("Transfer",
        {
            fromBlock: startBlock,
            toBlock: endBlock
        }).then(async events => {
            try {
                events.forEach(async (event) => {
                    let TransferEvent = new TransferEvents()
                    let doesExist: boolean | undefined
                    if (checkDuplicates) {
                        doesExist = await TransferEvent.DoesTransactionExist(event.transactionHash, pastEventConnectionName)
                    }
                    if (doesExist === false || doesExist === undefined) {
                        await TransferEvent.InsertTransferEvents(filterEvents(event), pastEventConnectionName)
                    } else {
                        console.warn(`Skipping ${event.transactionHash} because its already in the DB`)
                    }
                })

            } catch (e) {
                if (e instanceof TypeError) {
                    console.error(e)
                }
            }
        })
        .catch((err) => {
            console.error(err)
            console.error("fromBlock:", startBlock)
            console.error("endBlock:", endBlock)
        });
}
/**
 * This wrapper function will create a contract, and call the function which will watch
 * for new events and insert them into the DB.
 * @param contractAddress - The address of the contract you want to get events for
 * @param etherScanApiKey - Your API key for Etherscan
 * @param infuraKey - Your infuraKey
 * @param connectionName - A string specifying the connection name that should be used.
 * @param checkDuplicates - A boolean highlighting if the duplicates should be checked for
 */
export async function CaptureCurrentEvents(contractAddress: string, etherScanApiKey: string,
    infuraKey: string, connectionName: string, checkDuplicates: boolean) {
    let contract = await createContract(contractAddress, etherScanApiKey, infuraKey)
    console.log("Starting to query new events")
    insertNewEventsToDb(contract, connectionName, checkDuplicates)

}

/**
 * This function will capture the past events, and insert them to the database.
 * This function is a bit buggy. It needs a bit of work before it can handle LARGE block ranges.
 * @param contractAddress - The address of the contract you want to get events for
 * @param etherScanApiKey - Your API key for Etherscan
 * @param infuraKey - Your infuraKey
 * @param connectionName - A string specifying the connection name that should be used.
 * @param checkDuplicates - A boolean highlighting if the duplicates should be checked for
 * @param startBlock - The start block for looking for past events.
 * @param endBlock - The end block for looking for past events.
 * @param contractStartBlock - The block this smart contract was created at.
 * @param delimeter - The "chunk" of past events to query at once (less than 10,000 please).
 */
export async function CapturePastEvents(contractAddress: string, etherScanApiKey: string,
    infuraKey: string, startBlock: number | string, endBlock: number | string,
    contractStartBlock: number, pastEventConnectionName: string, checkDuplicates: boolean,
    delimeter = 10000) {

    if (LATESTBLOCK !== undefined || typeof endBlock === typeof 5) {
        let contract = await createContract(contractAddress, etherScanApiKey, infuraKey)
        console.log("Starting to look for past events")
        let [newStartBlock, newEndBlock] = blockRange(startBlock, endBlock, contractStartBlock)
        let blockArray = createBlockArray(newStartBlock, newEndBlock, delimeter)
        console.log("Block Array:", blockArray)

        for (let index = 0; index < blockArray.length; index++) {
            const element = blockArray[index];
            console.log(`Adding Past events to DB, starting from block ${element["startBlock"]} to ${element["endBlock"]} `);
            insertPastEventsToDb(contract, element["startBlock"], element["endBlock"],
                pastEventConnectionName, checkDuplicates)
        }
    } else {
        console.log("Waiting for LATESTBLOCK to be set")
        setTimeout(CapturePastEvents, 2500)
    }
}