import jwt from 'jsonwebtoken';
import { combineResolvers } from 'graphql-resolvers';
import { AuthenticationError, UserInputError } from 'apollo-server';

import { isAdmin } from './authorization';

const createToken = async (user, secret, expiresIn) => {
    const { id, email, username, role } = user;
    return await jwt.sign({ id, email, username, role }, secret, {
        expiresIn,
    });
};

export default {
    Query: {
        users: async (parent, args, { models }) => {
            return await models.User.findAll();
        },
        user: async (parent, { id }, { models }) => {
            return await models.User.findById(id);
        },
        me: async (parent, args, { models, me }) => {
            if (!me) {
                return null;
            }

            return await models.User.findById(me.id);
        },
    },

    Mutation: {
        signUp: async (
            parent,
            { email, password, rememberMe },
            { models, secret },
        ) => {
            const user = await models.User.create({
                email,
                password,
            });

            if (rememberMe)
                return { token: createToken(user, secret, '31d') };
            else
                return { token: createToken(user, secret, '60m') };
        },

        signIn: async (
            parent,
            { login, password, rememberMe },
            { models, secret },
        ) => {
            const user = await models.User.findByLogin(login);

            if (!user) {
                throw new UserInputError(
                    'No user found with these login credentials.',
                );
            }

            const isValid = await user.validatePassword(password);

            if (!isValid) {
                throw new AuthenticationError('Invalid password.');
            }

            if (rememberMe)
                return { token: createToken(user, secret, '31d') };
            else
                return { token: createToken(user, secret, '60m') };
        },

        deleteUser: combineResolvers(
            isAdmin,
            async (parent, { id }, { models }) => {
                return await models.User.destroy({
                    where: { id },
                });
            },
        ),
    },

    User: {
        messages: async (user, args, { models }) => {
            return await models.Message.findAll({
                where: {
                    userId: user.id,
                },
            });
        },
        
        saves: async (user, args, { models }) => {
            return await models.Save.findAll({
                where: {
                    userId: user.id,
                },
            });
        },
    },
};
