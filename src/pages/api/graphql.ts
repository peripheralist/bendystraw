// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import resolvers from "@/graphql/resolvers";
import typeDefs from "@/graphql/schema";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "@apollo/server-plugin-landing-page-graphql-playground";
import { startServerAndCreateNextHandler } from "@as-integrations/next";

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground({
      title: "BendyStraw | Juicebox Graphql API",
    }),
  ],
});

const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async (req, res) => ({ req, res }),
});

export default handler;
