import { Contract } from "web3-eth-contract"
import Web3 from 'web3';
import { TransferEvents } from "./addEventsToDatabase"

const client = require('node-rest-client-promise').Client();

const etherscan_url_base = "http://api.etherscan.io/api?module=contract&action=getabi"

//let LATESTBLOCK: undefined | number = undefined
let LATESTBLOCK: undefined | number = 14141767
//let LATESTBLOCK: undefined | number = 14141767

interface BlockObject {
    startBlock: number;
    endBlock: number;
}

/**
 * This function will get the contracts ABI, needed down the road.
 * @param {string} contractAddress - The address of the contract you want to get events for
 * @param {string} etherScanApiKey - Your API key for Etherscan
 * @returns {object} - The contract ABI
 */
async function getContractAbi(contractAddress: string, etherScanApiKey: string) {
    const etherescan_url = `${etherscan_url_base}&address=${contractAddress}&apikey=${etherScanApiKey}`
    console.log(`Getting contract ABI for: ${contractAddress}`)
    const etherescan_response = await client.getPromise(etherescan_url)
    const contractAbi = JSON.parse(etherescan_response.data.result);
    console.log("Got the ABI")
    return contractAbi;
}

/**
 * This function will create a 'contract' object, which will be used to get events
 * @param {string} contractAddress - The address of the contract you want to get events for
 * @param {string} etherScanApiKey - Your API key for Etherscan
 * @param {string} infuraKey - Your infuraKey
 * @returns {Contract} - The contract object
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
    console.log("Contract object created:", typeof contract)
    return contract
}

/**
 * Helper function which properly parses the return from Web3 and gets the desired values
 * @param event - The returned events
 * @returns {object}  - The desired values
 */
function filterEvents(event: any): object {
    const picked = (({ address, transactionHash, blockNumber, returnValues: { from, to, tokenId } }) => (
        { transactionHash, "contractAddress": address, "blockNumber": parseInt(blockNumber), "tokenId": parseInt(tokenId), "fromAddress": from, "toAddress": to }
    ))(event);
    return picked
}

/**
 * This function will query new events on the smart contract, and add them to the allEvents Array
 * @param {Contract} contract - Web3 contract objectj
 * @param {Array<object>} allEvents - An array that will store all the events which occured
 */
function queryNewEvents(contract: Contract, allEvents: Array<object>) {
    console.log("Starting to query new events")
    contract.events.Transfer()
        .on('data', (event: any) => {
            if (LATESTBLOCK === undefined) {
                LATESTBLOCK = event.blockNumber
            }
            allEvents.push(filterEvents(event))
        })
        .on('error', console.error);
    //.on('error', console.error);
}

/**
 * This function will query past events
 * @param  {Contract} contract - Web3 contract object
 * @param {number | string} startBlock - The block to start at, either provide a number or "earliest"
 * @param {number | string} endBlock - The block to end at, either provide a number or "latest"
 * @returns
 */
function insertPastEventsToDB(contract: Contract, startBlock: number | string,
    endBlock: number | string) {
    contract.getPastEvents("Transfer",
        {
            fromBlock: startBlock,
            toBlock: endBlock
        }).then(events => {
            try {
                // Add events to the DB directly
                events.forEach((event) => {
                    let TransferEvent = new TransferEvents()
                    TransferEvent.InsertTransferEvents(filterEvents(event))
                    // Add flag for checking for duplicates before inserts.
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
function queryPastEvents(contract: Contract, startBlock: number | string,
    endBlock: number | string) {
    let pastEvents: Array<object> = []
    let events = contract.getPastEvents("Transfer",
        {
            fromBlock: startBlock,
            toBlock: endBlock
        }).then(events => {
            try {
                // Add events to the DB directly
                events.forEach((event) => pastEvents.push(filterEvents(event)))
                return pastEvents

            } catch (e) {
                if (e instanceof TypeError) {
                    console.error(e)
                }
                return pastEvents
            }
        })
        .catch((err) => {
            console.error(err)
            console.error("fromBlock:", startBlock)
            console.error("endBlock:", endBlock)
            return pastEvents
        });
    return events
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
 * This is a wrapper function which actually queries all the past events, and puts them all into an array.
 * @param contract - Web3 Contract object
 * @param startBlock - Block to start at
 * @param endBlock - The block to end at
 * @param contractStartBlock - The block the smart contract was created at.
 * @param delimeter - The delimeter for querying (10000)
 * @returns
 */
async function callQueryPastEvents(contract: Contract, startBlock: number | string,
    endBlock: number | string, contractStartBlock: number, delimeter = 10000) {
    let newEndBlock: any //Actually only a number but this hack is needed
    let newStartBlock: any //Actually only a number but this hack is needed
    let pastEvents: Array<object> = [];

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
    let blockArray = createBlockArray(newStartBlock, newEndBlock, delimeter)
    console.log("Block Array:", blockArray)

    for (let index = 0; index < blockArray.length; index++) {
        const element = blockArray[index];
        console.log(`Querying Past events from block ${element["startBlock"]} to ${element["endBlock"]} `);
        let events = await queryPastEvents(contract, element["startBlock"], element["endBlock"])
        insertPastEventsToDB(contract, element["startBlock"], element["endBlock"])
        pastEvents = pastEvents.concat(events);
    }
    return pastEvents
}

/**
 * This function will return a promise array<object> which will contain
 * all the past events.
 * This isn't pretty, but it works. My newbie experience with promises let me to
 * have to utilize a few wrappers.
 * @param contractAddress - Contract address you want to watch.
 * @param etherScanApiKey - Etherscan API Key
 * @param infuraKey - Infura Key
 * @param includePastTransactions - Do you want to include past transactions?
 * @param startBlock - What block should we start at?
 * @param endBlock - What block should we end at?
 * @param contractStartBlock - What is the contracts star block?
 * @param delimeter - If we are looking back, whats the maximum logs we should query for at a time (10000)
 */

export async function getCurrentEvents(contractAddress: string, etherScanApiKey: string,
    infuraKey: string, container: Array<object>) {
    let contract = await createContract(contractAddress, etherScanApiKey, infuraKey)
    queryNewEvents(contract, container)
}
export async function getPastEvents(contractAddress: string, etherScanApiKey: string,
    infuraKey: string, includePastTransactions: boolean,
    startBlock: number | string, endBlock: number | string,
    contractStartBlock: number, delimeter = 10000): Promise<object[]> {
    let pastEvents: Array<object> = [];
    let newEvents: Array<object> = [];
    let contract = await createContract(contractAddress, etherScanApiKey, infuraKey)

    if (includePastTransactions) {
        if (LATESTBLOCK !== undefined) {
            console.log("Starting to look for past events")
            //let pastEvents: Array<object> = callQueryPastEvents(contract, startBlock, endBlock, contractStartBlock, 10000)
            pastEvents = await callQueryPastEvents(contract, startBlock, endBlock, contractStartBlock, 10000)
        } else {
            console.log("Waiting for LATESTBLOCK to be set")
            setTimeout(getPastEvents, 2500)
        }
    }
    return pastEvents
}