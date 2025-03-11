const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/dbConfig');
const migration = require('../migrations/20250301000000-add-puntifedelta-and-orders');

async function runMigration() {
  try {
    console.log('Inizio migrazione...');
    await migration.up(sequelize.getQueryInterface(), Sequelize);
    console.log('Migrazione completata con successo!');
    process.exit(0);
  } catch (error) {
    console.error('Errore durante la migrazione:', error);
    process.exit(1);
  }
}

runMigration();