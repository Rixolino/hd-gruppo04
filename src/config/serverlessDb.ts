import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
});

export const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export default sequelize;