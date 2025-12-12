import { combineResolvers } from 'graphql-resolvers';
import pubsub, { EVENTS } from '../subscription/index.js';
import Sequelize from 'sequelize';
import { isAuthenticated, isPlayerOwner } from './authorization.js';

const toCursorHash = string => Buffer.from(string).toString('base64');
const fromCursorHash = string =>
  Buffer.from(string, 'base64').toString('ascii');

export default {
  Query: {    
    	players: async (parent, { cursor, limit = 100 }, { models }) => {
			const cursorOptions = cursor
				? {
					where: {
						createdAt: {
							[Sequelize.Op.lt]: fromCursorHash(cursor),
						},
					},
				}
				: {};
			const players = await models.Player.findAll({
				order: [['createdAt', 'DESC']],
				limit: limit + 1,
				...cursorOptions,
      });
      
      if (players.length < 1) return;

			const hasNextPage = players.length > limit;
			const edges = hasNextPage ? players.slice(0, -1) : players;


			return {
				edges,
				pageInfo: {
					hasNextPage,
					endCursor: toCursorHash(
					  	edges[edges.length - 1].createdAt.toString(),
					),
				},
			};
		},
		player: async (parent, { id }, { models }) => {
			return await models.Player.findByPk(id);
		},
  },

  Mutation: {
    createPlayer: combineResolvers(
      isAuthenticated,
      async (parent, { jsonData }, { models, me }) => {
        await models.Player.destroy({where: {userId: me.id}});
        const player = await models.Player.create({
          jsonData,
          userId: me.id,
        });

        pubsub.publish(EVENTS.PLAYER.CONNECTED, {
          playerConnected: { player },
        });
        
        return player;
      },
    ),

    updatePlayer: combineResolvers(
      isAuthenticated,
      async (parent, { jsonData }, { models, me }) => {
        let doUpdate = false;
        let player = null;
        const date = new Date();
        const playerInstances = await models.Player.findAll({where: {userId: me.id}});
        if (playerInstances.length === 0) {
          player = await models.Player.create({
            jsonData,
            userId: me.id,
          });
        }
        else if (playerInstances[0] && playerInstances[0].createdAt < date.setSeconds(date.getSeconds() - 60)) {
          doUpdate = true;
        }
        if (doUpdate === false && player === null) {
          player = await models.Player.build({
            jsonData,
            userId: me.id,
            id: "update",
            createdAt: date.setSeconds(date.getSeconds() + 1)
          });
        } 
        else if (doUpdate === true && player === null) {
          player = playerInstances[0]
          player.createdAt = date.setSeconds(date.getSeconds() + 1);
          player.save();
        }

        pubsub.publish(EVENTS.PLAYER.UPDATED, {
          playerUpdated: { player },
        });
        
        return player;
      },
    ),

    deletePlayer: combineResolvers(
      isAuthenticated,
      async (parent, {}, { models, me }) => {
        const players = await models.Player.findAll({where: {userId: me.id}});
        players.map(player => {
            pubsub.publish(EVENTS.PLAYER.DISCONNECTED, {
                playerDisconnected: { player },
            });
            player.destroy();
        })
        return true;
      },
    ),
  },

  Player: {
    user: async (player, args, { models }) => {
      return await models.User.findByPk(player.userId);
    },
  },

  Subscription: {
    playerConnected: {
      subscribe: () => pubsub.asyncIterator(EVENTS.PLAYER.CONNECTED),
    },
    playerUpdated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.PLAYER.UPDATED),
    },
    playerDisconnected: {
      subscribe: () => pubsub.asyncIterator(EVENTS.PLAYER.DISCONNECTED),
    },
  },
};
