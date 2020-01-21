import { combineResolvers } from 'graphql-resolvers';
import pubsub, { EVENTS } from '../subscription';
import Sequelize from 'sequelize';
import { isAuthenticated, isPlayerOwner } from './authorization';

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
			return await models.Player.findById(id);
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
        const date = new Date();
        const player = await models.Player.build({
          jsonData,
          userId: me.id,
          id: "update",
          createdAt: date.setSeconds(date.getSeconds() + 1)
        });

        pubsub.publish(EVENTS.PLAYER.UPDATED, {
          playerUpdated: { player },
        });
        
        return player;
      },
    ),

    deletePlayer: combineResolvers(
      isAuthenticated,
      isPlayerOwner,
      async (parent, { id }, { models }) => {
        return await models.Player.destroy({ where: { id } });
      },
    ),
  },

  Player: {
    user: async (player, args, { models }) => {
      return await models.User.findById(player.userId);
    },
  },

  Subscription: {
    playerConnected: {
      subscribe: () => pubsub.asyncIterator(EVENTS.PLAYER.CONNECTED),
    },
    playerUpdated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.PLAYER.UPDATED),
    },
  },
};
