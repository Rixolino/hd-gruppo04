'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Verifica se la tabella esiste già
      await queryInterface.showAllTables().then(tables => {
        if (!tables.includes('services')) {
          return queryInterface.createTable('services', {
            id: {
              type: Sequelize.STRING,
              allowNull: false,
              primaryKey: true
            },
            name: {
              type: Sequelize.STRING,
              allowNull: false
            },
            description: {
              type: Sequelize.TEXT,
              allowNull: false
            },
            price: {
              type: Sequelize.DECIMAL(10, 2),
              allowNull: false
            },
            category: {
              type: Sequelize.STRING,
              allowNull: false
            },
            icon: {
              type: Sequelize.STRING,
              allowNull: false
            },
            deliveryTime: {
              type: Sequelize.STRING,
              allowNull: false
            },
            revisions: {
              type: Sequelize.STRING,
              allowNull: false
            },
            createdAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
          });
        }
      });
    } catch (error) {
      console.error('Errore durante la creazione della tabella services:', error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('services');
  }
};