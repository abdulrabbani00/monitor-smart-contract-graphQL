import "reflect-metadata";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server";
import { TransferResolver } from "./resolvers/transferResolver"; // add this
import { buildSchema } from "type-graphql";

/**
 * This function will do the following:
 * 1. Create a connection to the DB.
 * 2. Add the schema for the DB (if one does not exists).
 *      1. It will not override a schema!
 * 3. Start the graphQL server
 * @param port - Port to start GraphQL server
 */
export async function startGraphQL(port: number) {
    const connection = await createConnection()
    const schema = await buildSchema({
        resolvers: [TransferResolver]
    })
    const server = new ApolloServer({ schema })
    await server.listen(port)
    console.log("Server has started!")
}