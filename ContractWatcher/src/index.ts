import { argv } from './configToArgs';
import { getDesiredEvents } from './contractTransfer';

function main() {
    // await loadConfig();
    getDesiredEvents(argv.contractAddress, argv.etherScanApiKey, argv.infuraKey,
        argv.includePastTransactions, argv.startBlock, argv.endBlock, argv.contractStartBlock, argv.pastQueryDelimeter)

    //(async () => {
    //    await getDesiredEvents(argv.contractAddress, argv.etherScanApiKey, argv.infuraKey,
    //        argv.includePastTransactions, argv.startBlock, argv.endBlock, argv.contractStartBlock, argv.pastQueryDelimeter)
    //})()

}

main();

// (async () => {
//     try {
//         var output = await main();
//         console.log(output);
//     } catch (e) {
//         console.error(e)
//         // Deal with the fact the chain failed
//     }
// })();