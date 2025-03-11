'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Verifica se la colonna settings esiste
      const tableInfo = await queryInterface.describeTable('users');
      
      // Se la colonna non esiste, aggiungila
      if (!tableInfo.settings) {
        await queryInterface.addColumn('users', 'settings', {
          type: Sequelize.JSON,
          allowNull: true
        });
        console.log('Colonna settings aggiunta con successo.');
      } else {
        console.log('La colonna settings esiste già.');
      }
    } catch (error) {
      console.error('Errore durante la migrazione:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Non rimuoviamo la colonna nel down per sicurezza
  }
};