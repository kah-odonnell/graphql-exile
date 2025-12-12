import { gql } from '@apollo/client';

import userSchema from './user.js';
import messageSchema from './message.js';
import saveSchema from './save.js';
import playerSchema from './player.js';

const linkSchema = gql`
  scalar Date

  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
  
  type Subscription {
    _: Boolean
  }
`;

export default [linkSchema, userSchema, messageSchema, saveSchema, playerSchema];
