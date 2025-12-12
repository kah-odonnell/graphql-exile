import { gql } from '@apollo/client';

export default gql`
  extend type Query {
    saves: [Save!]!
    getSave(id: ID!): Save!
  }

  extend type Mutation {
    saveGame(jsonData: String!): Save!
    deleteSave(id: ID!): Boolean!
  }

  type Save {
    id: ID!
    jsonData: String!
    createdAt: Date!
    user: User!
  }  
`;
