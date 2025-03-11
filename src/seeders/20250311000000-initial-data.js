'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seed degli utenti
    await queryInterface.bulkInsert('utenti', [
      {
        nome: 'SIMONE',
        cognome: 'Rixolino',
        email: 'elrisolix.erx@outlook.com',
        password: '$2b$10$Ospmp1.8H98CTqVpc5LzHO5P3DoxR8X1WZ3z3/3Tv0OCLc2uirNsG',
        isAdmin: true,
        puntifedelta: 0,
        isDeleted: false,
        settings: JSON.stringify({ 
          fontSize: 2, 
          highContrast: false, 
          reduceAnimations: false, 
          colorBlindMode: 'none',
          theme: 'light'
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nome: 'SIMONa',
        cognome: 'Rixolino',
        email: 'simonerisola.sr@gmail.com',
        password: '$2b$10$S11T16Can5g0/Re6B75RDuYgIKDSp4rOtDDumGR6/vweKeeydARce',
        isAdmin: false,
        puntifedelta: 0,
        isDeleted: false,
        settings: JSON.stringify({ 
          fontSize: 1, 
          highContrast: false, 
          reduceAnimations: false, 
          colorBlindMode: 'none',
          theme: 'dark'
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Seed dei servizi
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
      }
    ]);

    // Seed delle impostazioni
    await queryInterface.bulkInsert('settings', [
      {
        user_id: 1,
        fontSize: 2,
        highContrast: false,
        reduceAnimations: false,
        colorBlindMode: 'none',
        theme: 'light',
        primaryColor: 'default',
        layout: 'default',
        emailNotifications: true,
        orderUpdates: true,
        promotions: false,
        newsletter: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        fontSize: 1,
        highContrast: false,
        reduceAnimations: false,
        colorBlindMode: 'none',
        theme: 'dark',
        primaryColor: 'red',
        layout: 'default',
        emailNotifications: true,
        orderUpdates: true,
        promotions: false,
        newsletter: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('settings', null, {});
    await queryInterface.bulkDelete('services', null, {});
    await queryInterface.bulkDelete('utenti', null, {});
  }
};