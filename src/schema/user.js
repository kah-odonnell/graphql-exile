import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    users: [User!]
    user(id: ID!): User
    me: User
  }

  extend type Mutation {
    signUp(
      email: String!
      password: String!
      rememberMe: Boolean!
    ): Token!

    signIn(login: String!, password: String!, rememberMe: Boolean!): Token!
    deleteUser(id: ID!): Boolean!
  }

  type Token {
    token: String!
  }

  type User {
    id: ID!
    username: String
    email: String!
    role: String
    messages: [Message!]
    saves: [Save!]
  }
`;
