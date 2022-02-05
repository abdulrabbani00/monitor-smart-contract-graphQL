import "reflect-metadata";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server";
import { TransferResolver } from "./resolvers/transferResolver"; // add this
import { buildSchema } from "type-graphql";

async function startGraphQL() {
    const connection = await createConnection()
    const schema = await buildSchema({
        resolvers: [TransferResolver]
    })
    const server = new ApolloServer({ schema })
    await server.listen(4001)
    console.log("Server has started!")
}

startGraphQL()