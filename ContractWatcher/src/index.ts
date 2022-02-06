import { argv } from './configToArgs';
import { CapturePastEvents, CaptureCurrentEvents } from './contractTransfer';
import { startGraphQL } from './runGraphQL'
import { createConnection } from "typeorm";

/**
 * This function will do the following
 * 1. Spin-up the graphQL server.
 *      1. If the DB schema has not been implemented it will do that as well.
 * 2. Create a DB connection for adding new events to the DB.
 * 3. Start the function which will actively listen for new events.
 * 4. Create a DB connection for adding past events to the DB.
 * 5. Start the function which will get all the past events for the block range specified,
 *  and adding all events to the DB.
 */
async function main() {
    await startGraphQL(argv.graphqlPort)

    createConnection(argv.newEventConnectionName)
    CaptureCurrentEvents(argv.contractAddress, argv.etherScanApiKey, argv.infuraKey,
        argv.newEventConnectionName, argv.checkDuplications)

    if (argv.includePastTransactions) {
        console.log("Going to check for past events!")
        createConnection(argv.pastEventConnectionName)
        await CapturePastEvents(argv.contractAddress, argv.etherScanApiKey, argv.infuraKey,
            argv.startBlock, argv.endBlock,
            argv.contractStartBlock, argv.pastEventConnectionName, argv.checkDuplications,
            argv.pastQueryDelimeter)
    }

}

main()