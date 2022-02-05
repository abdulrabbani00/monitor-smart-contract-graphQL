import * as yargs from 'yargs'
import { Config } from './config';
import * as config from './config.json'

export let argv = yargs.options({
    infuraKey: {
        alias: 'i',
        type: 'string',
        default: config.infrastructure.infuraKey,
        demandOption: true,
        description: 'Infura Key'
    },
    etherScanApiKey: {
        alias: 'e',
        type: 'string',
        default: config.infrastructure.etherScanApiKey,
        description: 'Etherscan API key'
    },
    contractAddress: {
        alias: 'c',
        type: 'string',
        default: config.contract.contractAddress,
        description: 'Contract Address'
    },
    includePastTransactions: {
        alias: 'p',
        type: 'boolean',
        default: config.contract.includePastTransactions,
        description: 'What is the block that this contract was created in?'
    },
    contractStartBlock: {
        alias: 'cb',
        default: config.contract.contractStartBlock,
        description: 'What is the start block for past transcations'
    },
    startBlock: {
        alias: 'sb',
        default: config.contract.startBlock,
        description: 'What is the start block for past transcations'
    },
    endBlock: {
        alias: 'eb',
        default: config.contract.endBlock,
        description: 'What is the start block for past transcations'
    },
    pastQueryDelimeter: {
        alias: 'pq',
        default: config.contract.pastQueryDelimeter,
        description: 'When query past events, what should be the max delimeter for each call'
    }
}).parseSync();