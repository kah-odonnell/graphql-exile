import { ForbiddenError } from 'apollo-server';
import { combineResolvers, skip } from 'graphql-resolvers';

export const isAuthenticated = (parent, args, { me }) =>
  me ? skip : new ForbiddenError('Not authenticated as user.');

export const isAdmin = combineResolvers(
  isAuthenticated,
  (parent, args, { me: { role } }) =>
    role === 'ADMIN'
      ? skip
      : new ForbiddenError('Not authorized as admin.'),
);

export const isMessageOwner = async (
  parent,
  { id },
  { models, me },
) => {
  const message = await models.Message.findByPk(id, { raw: true });

  if (message.userId !== me.id) {
    throw new ForbiddenError('Not authenticated as owner.');
  }

  return skip;
};

export const isSaveOwner = async (
	parent,
	{ id },
	{ models, me },
  ) => {
	const save = await models.Save.findByPk(id, { raw: true });
  
	if (save.userId !== me.id) {
	  throw new ForbiddenError('Not authenticated as owner.');
	}
  
	return skip;
  };


export const isPlayerOwner = async (
    parent,
    { id },
    { models, me },
  ) => {
    const player = await models.Player.findByPk(id, { raw: true });
    if (!player) {
      throw new ForbiddenError('No player found with that id.');
    }
  
    if (player.userId !== me.id) {
      throw new ForbiddenError('Not authenticated as owner.');
    }
  
    return skip;
  };