import 'dotenv/config';
import cors from 'cors';
import uuidv4 from 'uuid/v4';
import jwt from 'jsonwebtoken';
import express from 'express';
import {
    ApolloServer,
    AuthenticationError,
} from 'apollo-server-express';

import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';
import http from 'http';

const app = express();

app.use(cors());


const getMe = async req => {
    const token = (req.headers) ? req.headers['x-token'] : req['x-token'];

    if (token) {
        try {
            return await jwt.verify(token, process.env.SECRET);
        } catch (e) {
            throw new AuthenticationError(
                'Your session expired. Sign in again.',
            );
        }
    }
};

const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    formatError: error => {
        // remove the internal sequelize error message
        // leave only the important validation error
        const message = error.message
            .replace('SequelizeValidationError: ', '')
            .replace('Validation error: ', '');

        return {
            ...error,
            message,
        };
    },
	context: async ({ req, connection }) => {
	  if (connection) {
		return {
		  models,
		};
	  }
	  if (req) {
		const me = await getMe(req);
		return {
		  models,
		  me,
		  secret: process.env.SECRET,
		};
	  }
    }, 
    subscriptions: {
        onConnect: (connectionParams, webSocket, context) => {
            /*
            if (connectionParams["x-token"]) {
              return getMe({"x-token": connectionParams["x-token"]})
                .then(player => {
                    console.log("player " + player.id + " connected");
                    return {
                        currentPlayer: player,
                    };
                });
            }
            */
        },
        onDisconnect: (webSocket, context) => {
            /*
            if (context.currentPlayer) {
                console.log("disconnect: " + context.currentPlayer)
                models.Player.destroy({where: {id: context.currentPlayer.id}});
            }
            */
        },
    }
});

server.applyMiddleware({ app, path: '/graphql' });
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const eraseDatabaseOnSync = (process.env.PORT) ? false : true;

const port = process.env.PORT || 8000;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
    if (eraseDatabaseOnSync) {
        createUsersWithMessages(new Date());
    }

    httpServer.listen({ port }, () => {
        console.log(`Apollo Server on http://localhost:${port}/graphql`);
    });
});

const createUsersWithMessages = async date => {
    await models.User.create(
        {
            username: 'rwieruch',
            email: 'hello@robin.com',
            password: 'rwieruch',
            role: 'ADMIN',
            messages: [
                {
                    text: 'Published the Road to learn React',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
                },
            ],
        },
        {
            include: [models.Message],
        },
    );

    await models.User.create(
        {
            username: 'ddavids',
            email: 'hello@david.com',
            password: 'ddavids',
            messages: [
                {
                    text: 'Happy to release ...',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
                },
                {
                    text: 'Published a complete ...',
                    createdAt: date.setSeconds(date.getSeconds() + 1),
                },
            ],
        },
        {
            include: [models.Message],
        },
    );
};