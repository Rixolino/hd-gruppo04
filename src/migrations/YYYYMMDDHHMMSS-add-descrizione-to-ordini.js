'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ordini', 'descrizione', {
      type: Sequelize.TEXT,
      allowNull: true, // Modifica secondo necessità
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ordini', 'descrizione');
  }
};