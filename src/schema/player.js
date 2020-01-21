import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    players(cursor: String, limit: Int): PlayerConnection
    player(id: ID!): Player!
  }

  extend type Mutation {
    createPlayer(jsonData: String!): Player!
    updatePlayer(jsonData: String!): Player!
    deletePlayer(id: ID!): Boolean!
  }

  type Player {
    id: ID!
    jsonData: String!
    createdAt: Date
    user: User!
  }
  
  type PlayerConnection {
    edges: [Player!]!
    pageInfo: PlayerPageInfo!
  }

  type PlayerPageInfo {
    endCursor: String!
    hasNextPage: Boolean!
  }

  extend type Subscription {
    playerConnected: PlayerConnected!
    playerUpdated: PlayerUpdated!
  }
  
  type PlayerConnected {
    player: Player!
  }

  type PlayerUpdated {
    player: Player!
  }
`;
