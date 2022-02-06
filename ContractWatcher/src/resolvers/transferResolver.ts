import { Resolver, Query, Arg, Mutation } from "type-graphql";
import { Transfer } from "../models/transfers";

/**
 * Define all user CURD commands for graphQL end users.
 */
@Resolver()
export class TransferResolver {
    @Query(() => [Transfer])
    events() {
        return Transfer.find()
    }
    // Required by the project
    @Query(() => [Transfer])
    contracts(@Arg("contractAddress") contractAddress: string) {
        return Transfer.find({ where: { contractAddress: contractAddress.toLowerCase() } });
    }

    @Query(() => [Transfer])
    allContractAddressAndTokenId(@Arg("contractAddress") contractAddress: string, @Arg("tokenId") tokenId: number) {
        return Transfer.find({ where: { contractAddress: contractAddress.toLowerCase(), tokenId } });
    }

    @Query(() => [Transfer])
    allUnread() {
        return Transfer.find({ where: { "isRead": false } });
    }

    @Mutation(() => [Transfer])
    async markReadOrUnread(@Arg("contractAddress") contractAddress: string, @Arg("tokenId") tokenId: number,
        @Arg("isRead") isRead: boolean) {
        const events = await Transfer.find({ where: { contractAddress: contractAddress.toLowerCase(), tokenId } });
        if (!events) throw new Error("Event not found");
        events.forEach(event => event.isRead = isRead)
        await Transfer.save(events);
        return events;
    }

    // Additional
    @Query(() => [Transfer])
    transactionHash(@Arg("transactionHash") transactionHash: string) {
        return Transfer.find({ where: { transactionHash: transactionHash.toLowerCase() } });
    }
    @Query(() => [Transfer])
    allFromAddressAndTokenId(@Arg("fromAddress") fromAddress: string, @Arg("tokenId") tokenId: number) {
        return Transfer.find({ where: { fromAddress: fromAddress.toLowerCase(), tokenId } });
    }
    @Query(() => [Transfer])
    allToAddressAndTokenId(@Arg("toAddress") toAddress: string, @Arg("tokenId") tokenId: number) {
        return Transfer.find({ where: { toAddress: toAddress.toLowerCase(), tokenId } });
    }
}
