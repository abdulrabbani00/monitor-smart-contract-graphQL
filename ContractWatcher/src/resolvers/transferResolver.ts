import { Resolver, Query } from "type-graphql";
import { Transfer } from "../models/transfers";

@Resolver()
export class TransferResolver {
    @Query(() => [Transfer])
    events() {
        return Transfer.find()
    }

    // @Mutation(() => Transfer)
    // async addEvent(@Arg("data") data: ) {
    //     const newEvent = Transfer.create(data);
    //     await newEvent.save();
    //     return newEvent;
    // }
}
