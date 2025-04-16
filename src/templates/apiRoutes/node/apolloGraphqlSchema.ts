export const apolloGraphqlSchemaTemplate = `
  import { GraphQLObjectType, GraphQLSchema } from 'graphql/type';
  import queryResolvers from './queries';
  import mutationResolvers from './mutations';
  
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType<any, any>({
      name: 'Query',
      fields: queryResolvers,
    }),
    mutation: new GraphQLObjectType<any, any>({
      name: 'Mutation',
      fields: mutationResolvers,
    }),
  });
  
  export default schema;
`;
