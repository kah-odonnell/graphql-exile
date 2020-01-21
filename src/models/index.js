import Sequelize from 'sequelize';


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
    User: sequelize.import('./user'),
    Message: sequelize.import('./message'),
    Save: sequelize.import('./save'),
    Player: sequelize.import('./player')
};

Object.keys(models).forEach(key => {
    if ('associate' in models[key]) {
        models[key].associate(models);
    }
});

export { sequelize };

export default models;
