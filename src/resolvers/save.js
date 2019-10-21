import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isSaveOwner } from './authorization';
import { AuthenticationError, UserInputError } from 'apollo-server';

export default {
  Query: {
    saves: async (parent, args, { models, me }) => {
      const user = await models.User.findById(me.id);
      if (!user) {
        throw new AuthenticationError(
            'You aren\'t logged in.',
        );
      }
      return await models.Save.findAll();
    },
    getSave: async (parent, { id }, { models, me }) => {
      const user = await models.User.findById(me.id);
      if (!user) {
        throw new AuthenticationError(
            'You aren\'t logged in.',
        );
      }
      return await models.Save.findById(id);
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
      return await models.User.findById(save.userId);
    },
  },
};
