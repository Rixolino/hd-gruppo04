import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { createConnection } from 'mysql2/promise';

dotenv.config();

const createDatabase = async () => {
    const connection = await createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3307'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.end();
};

// Usa direttamente i parametri dal file .env invece di DATABASE_URL
const sequelize = new Sequelize(
    process.env.DB_NAME!, 
    process.env.DB_USER!, 
    process.env.DB_PASSWORD!, 
    {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3307'),
        dialect: 'mysql',
        dialectOptions: {
            // Rimuoviamo le opzioni SSL che potrebbero causare problemi
        },
        logging: console.log
    }
);

const initializeDatabase = async () => {
    try {
        // Verifica la connessione
        await sequelize.authenticate();
        console.log('Connessione al database stabilita con successo.');
        
        // Sincronizza i modelli con il database
        await sequelize.sync();
        console.log('Tabelle create o aggiornate con successo.');
    } catch (error) {
        console.error('Impossibile connettersi al database:', error);
    }
};

export { sequelize, initializeDatabase };