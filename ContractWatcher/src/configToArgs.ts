import * as yargs from 'yargs'
import { Config } from './config';
import * as config from './config.json'

/**
 * This will create an object with all the arguments
 * You can set the arguments via the command line or the configuration file.
 * The command line will override the configuration file!
 *
 */
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
    },
    newEventConnectionName: {
        alias: 'ec',
        default: config.dbConnection.newEventsConnection,
        description: 'The DB connection name for new events (check ormconfig.json)'
    },
    pastEventConnectionName: {
        alias: 'pc',
        default: config.dbConnection.pastEventsConnection,
        description: 'The DB connection name for past events (check ormconfig.json)'
    },
    graphqlPort: {
        alias: 'gp',
        default: config.dbConnection.graphqlPort,
        description: 'The port to use for graphQL'
    },
    checkDuplications: {
        alias: 'cd',
        default: config.dbConnection.checkDuplications,
        description: 'Should we check for duplicate transactionHash before we return?'
    }
}).parseSync();