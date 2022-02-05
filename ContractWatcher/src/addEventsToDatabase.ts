import { createConnection, getConnection } from "typeorm";
import { Transfer } from "./models/transfers"; // add this

export class TransferEvents {

    InsertTransferEvents(events: object) {
        createConnection().then(async connection => {
            await getConnection().createQueryBuilder().insert()
                .into(Transfer)
                .values(events).execute();
        }).catch(error => console.log(error));
    }
}