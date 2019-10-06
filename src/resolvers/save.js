import { combineResolvers } from 'graphql-resolvers';

import { isAuthenticated, isSaveOwner } from './authorization';

export default {
  Query: {
    saves: async (parent, args, { models }) => {
      return await models.Save.findAll();
    },
    getSave: async (parent, { id }, { models }) => {
      return await models.Save.findById(id);
    },
  },

  Mutation: {
    saveGame: combineResolvers(
      isAuthenticated,
      async (parent, { jsonData }, { models, me }) => {
        await models.Save.destroy({where: {userId: me.id}});
        return await models.Save.create({
          jsonData,
          userId: me.id,
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
