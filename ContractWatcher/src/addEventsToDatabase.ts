import { createConnection, getConnection, getConnectionManager, getConnectionOptions } from "typeorm";
import { Transfer } from "./models/transfers"; // add this

/**
 * A class to handle reading and writing to the database in a programmatic sense.
 * If you want to allow users to read or write events, please look at:
 * `ContractWatcher/src/resolvers/transferResolver.ts`
 */
export class TransferEvents {

    /**
     * - Insert transfer events into the DB. Can be easiliy refactored to add
     * any event to the database.
     * @param events - The object to insert into the DB.
     * @param connectionName - The connection name used to add to connect to the DB (check ormconfig)
     */
    async InsertTransferEvents(events: object, connectionName: string) {
        const connectionManager = getConnectionManager();
        await getConnection(connectionName).createQueryBuilder().insert()
            .into(Transfer)
            .values(events).execute();

    }

    /**
     * - Check to see if a transaction ID exists in the DB
     * Can easily be refactored to check for other events.
     * @param transactionHash
     * @param connectionName
     * @returns - Should be a boolean indicating if the transaction hash exists in the DB.
     */
    async DoesTransactionExist(transactionHash: string, connectionName: string) {
        const doesExist = await getConnection(connectionName).createQueryBuilder()
            .select("events")
            .from(Transfer, "events")
            .where("events.transactionHash = :transactionHash", { transactionHash })
            .getOne()

        return doesExist !== undefined
    }
}