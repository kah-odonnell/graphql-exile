import jwt from 'jsonwebtoken';
import { combineResolvers } from 'graphql-resolvers';
import { GraphQLError } from 'graphql';
import models, { sequelize } from '../models/index.js';

import { isAdmin } from './authorization.js';

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
            return await models.User.findByPk(id);
        },
        me: async (parent, args, { models, me }) => {
            if (!me) {
                return null;
            }

            return await models.User.findByPk(me.id);
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

        signIn: async (parent, args, context, info) => {
            const user = await models.User.findByLogin(args.login);

            if (!user) {
                throw new GraphQLError(
                    'No user found with these login credentials.',
                );
            }

            const isValid = await user.validatePassword(args.password);

            if (!isValid) {
                throw new GraphQLError('Invalid password.');
            }

            if (args.rememberMe)
                return { token: createToken(user, context.secret, '31d') };
            else
                return { token: createToken(user, context.secret, '60m') };
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
