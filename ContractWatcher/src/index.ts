import { argv } from './configToArgs';
import { getPastEvents, getCurrentEvents } from './contractTransfer';

async function main() {
    // let currentEvents: Array<object> = []
    // getCurrentEvents(argv.contractAddress, argv.etherScanApiKey, argv.infuraKey, currentEvents)
    let pastEvents = await getPastEvents(argv.contractAddress, argv.etherScanApiKey, argv.infuraKey,
        argv.includePastTransactions, argv.startBlock, argv.endBlock, argv.contractStartBlock, argv.pastQueryDelimeter)

    console.log("Total past events:", pastEvents.length)
    //console.log("Total new events:", currentEvents.length)
}

main()