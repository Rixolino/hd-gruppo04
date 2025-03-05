import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { createConnection } from 'mysql2/promise';

dotenv.config();

const createDatabase = async () => {
    const connection = await createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.end();
};

const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD!, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
});

const initializeDatabase = async () => {
    await createDatabase();
    await sequelize.sync(); // Questo creerà le tabelle se non esistono
};

export { sequelize, initializeDatabase };