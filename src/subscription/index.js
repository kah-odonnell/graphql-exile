import { PubSub } from 'graphql-subscriptions';
import * as MESSAGE_EVENTS from './message.js';
import * as PLAYER_EVENTS from './player.js';
export const EVENTS = {
  MESSAGE: MESSAGE_EVENTS,
  PLAYER: PLAYER_EVENTS
};
export default new PubSub();