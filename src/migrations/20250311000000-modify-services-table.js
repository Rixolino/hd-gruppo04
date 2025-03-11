'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.describeTable('services').then(tableDefinition => {
      const changes = [];
      
      // Verifica se la colonna id esiste già
      if (!tableDefinition.id) {
        changes.push(
          queryInterface.addColumn('services', 'id', {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true
          })
        );
      }
      
      return Promise.all(changes);
    }).catch(error => {
      // Se la tabella non esiste, creala
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
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Non rimuoviamo la colonna id in caso di rollback
    // perché è una colonna primaria
  }
};