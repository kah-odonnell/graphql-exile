import { PubSub } from 'apollo-server';
import * as MESSAGE_EVENTS from './message';
import * as PLAYER_EVENTS from './player';
export const EVENTS = {
  MESSAGE: MESSAGE_EVENTS,
  PLAYER: PLAYER_EVENTS
};
export default new PubSub();