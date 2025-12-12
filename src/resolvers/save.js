import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isSaveOwner } from './authorization.js';
import { GraphQLError } from 'graphql';


export default {
  Query: {
    saves: async (parent, args, { models, me }) => {
      const user = await models.User.findByPk(me.id);
      if (!user) {
        throw new GraphQLError(
            'You aren\'t logged in.',
        );
      }
      return await models.Save.findAll({where: {userId: me.id}});
    },
    getSave: async (parent, { id }, { models, me }) => {
      const user = await models.User.findByPk(me.id);
      if (!user) {
        throw new GraphQLError(
            'You aren\'t logged in.',
        );
      }
      return await models.Save.findByPk(id);
    },
  },

  Mutation: {
    saveGame: combineResolvers(
      isAuthenticated,
      async (parent, { jsonData }, { models, me }) => {
        await models.Save.destroy({where: {userId: me.id}});
        return await models.Save.create({
          userId: me.id,
          jsonData,
        });
      },
    ),

    deleteSave: combineResolvers(
      isAuthenticated,
      isSaveOwner,
      async (parent, { id }, { models }) => {
        return await models.Save.destroy({ where: { id } });
      },
    ),
  },

  Save: {
    user: async (save, args, { models }) => {
      return await models.User.findByPk(save.userId);
    },
  },
};
