"use strict";
const { Sequelize } = require("sequelize");
require('dotenv').config();

// Valori predefiniti per evitare undefined
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || '3307',
  database: process.env.DB_DATABASE || process.env.DB_NAME,
  user: process.env.DB_USERNAME || process.env.DB_USER,
  password: process.env.DB_PASSWORD
};

// Log di diagnostica
console.log('Serverless DB config (sanitized):', {
  host: dbConfig.host || 'MISSING',
  port: dbConfig.port,
  database: dbConfig.database || 'MISSING',
  user: dbConfig.user || 'MISSING',
  passwordProvided: !!dbConfig.password
});

// Verifica che le variabili d'ambiente siano definite
if (!dbConfig.host || !dbConfig.database || !dbConfig.user || !dbConfig.password) {
  console.error('Variabili d\'ambiente del database mancanti!');
  // In ambiente di produzione, meglio usare valori di fallback piuttosto che interrompere l'esecuzione
}

// Configurazione con controllo esplicito dei valori
let sequelize;
try {
  sequelize = new Sequelize(
    dbConfig.database || 'dummy_db', // Valore di fallback
    dbConfig.user || 'dummy_user',   // Valore di fallback
    dbConfig.password || 'dummy_pass', // Valore di fallback 
    {
      host: dbConfig.host || '127.0.0.1', // Valore di fallback
      port: parseInt(dbConfig.port || '3307'),
      dialect: 'mysql',
      dialectOptions: {
        connectTimeout: 20000,
        ssl: {
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 2,
        min: 0,
        acquire: 15000,
        idle: 5000,
        evict: 10000
      },
      logging: false
    }
  );
} catch (error) {
  console.error('Errore nell\'inizializzazione di Sequelize:', error);
  // Creiamo un oggetto mock per evitare errori in cascade
  sequelize = {
    authenticate: async () => { throw new Error('Database non configurato correttamente'); },
    sync: async () => { throw new Error('Database non configurato correttamente'); },
    define: () => { throw new Error('Database non configurato correttamente'); }
  };
}

// Funzione per inizializzare il database
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connessione al database stabilita con successo (serverless)');
    return sequelize;
  } catch (error) {
    console.error('Impossibile connettersi al database serverless:', error);
    throw error;
  }
}

module.exports = { sequelize, initializeDatabase };