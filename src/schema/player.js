import { gql } from '@apollo/client';

export default gql`
  extend type Query {
    players(cursor: String, limit: Int): PlayerConnection
    player(id: ID!): Player!
  }

  extend type Mutation {
    createPlayer(jsonData: String!): Player!
    updatePlayer(jsonData: String!): Player!
    deletePlayer: Boolean!
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
    playerDisconnected: PlayerDisconnected!
  }
  
  type PlayerConnected {
    player: Player!
  }

  type PlayerUpdated {
    player: Player!
  }
  
  type PlayerDisconnected {
    player: Player!
  }
`;
