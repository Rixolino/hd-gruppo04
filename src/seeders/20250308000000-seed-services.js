'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('services', [
      {
        id: 'digitalizzazione',
        name: 'Digitalizzazione Documenti',
        description: 'Trasformiamo i tuoi documenti cartacei in file digitali, organizzati e facilmente accessibili.',
        price: 9.90,
        category: 'Digitalizzazione',
        icon: 'fa-file-import',
        deliveryTime: '3-5 giorni lavorativi',
        revisions: '1 revisione gratuita',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'volantini',
        name: 'Creazione Volantini',
        description: 'Design professionale di volantini pubblicitari per la tua attività.',
        price: 9.90,
        category: 'Grafica',
        icon: 'fa-paint-brush',
        deliveryTime: '2-4 giorni lavorativi',
        revisions: '2 revisioni gratuite',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'supporto',
        name: 'Supporto PC Remoto',
        description: 'Assistenza tecnica a distanza per risolvere problemi informatici.',
        price: 15.90,
        category: 'Supporto',
        icon: 'fa-headset',
        deliveryTime: '1-2 giorni lavorativi',
        revisions: 'Illimitate',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('services', null, {});
  }
};