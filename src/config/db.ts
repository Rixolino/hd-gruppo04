import { Sequelize } from 'sequelize';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});

// Inizializzazione del database
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connessione al database stabilita con successo.');
    await sequelize.sync();
    console.log('Modelli sincronizzati con il database.');
  } catch (error) {
    console.error('Impossibile connettersi al database:', error);
  }
})();

export default sequelize;
