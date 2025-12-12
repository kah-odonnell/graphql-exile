import { Sequelize } from 'sequelize';
import user from './user.js' 
import message from './message.js' 
import save from './save.js' 
import player from './player.js' 

let sequelize = null;

if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: true
        }
    })
} else {
    sequelize = new Sequelize(
        {
            dialect: 'sqlite',
            storage: './database.sqlite'
        },
    );
}

const models = {
    User: user(sequelize, Sequelize),
    Message: message(sequelize, Sequelize),
    Save: save(sequelize, Sequelize),
    Player: player(sequelize, Sequelize)
};

Object.keys(models).forEach(key => {
    if ('associate' in models[key]) {
        models[key].associate(models);
    }
});

export { sequelize };

export default models;
