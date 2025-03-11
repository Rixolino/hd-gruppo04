require('dotenv').config();
const { Sequelize } = require('sequelize');

// Crea una nuova istanza di Sequelize con i parametri corretti
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
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

// Importa i modelli
const UserModel = require('./models/userModel').default;
const SettingsModel = require('./models/settingsModel').default;
const ServiceModel = require('./models/serviceModel').default;
const OrderModel = require('./models/orderModel').default;
const PaymentModel = require('./models/paymentModel').default;

const syncDatabase = async () => {
  try {
    // Verifica la connessione
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Crea le tabelle con force:true (elimina e ricrea le tabelle)
    await sequelize.sync({ force: true });
    
    console.log('Database synchronized successfully.');
    
    // Seed dei dati iniziali
    await seedInitialData();
    
    console.log('Initial data seeded successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
};

const seedInitialData = async () => {
  // Seed dei servizi
  await ServiceModel.bulkCreate([
    {
      id: 'digitalizzazione',
      name: 'Digitalizzazione Documenti',
      description: 'Trasformiamo i tuoi documenti cartacei in file digitali, organizzati e facilmente accessibili.',
      price: 9.90,
      category: 'Digitalizzazione',
      icon: 'fa-file-import',
      deliveryTime: '3-5 giorni lavorativi',
      revisions: '1 revisione gratuita'
    },
    {
      id: 'supporto',
      name: 'Supporto PC Remoto',
      description: 'Assistenza tecnica a distanza per risolvere problemi informatici.',
      price: 15.90,
      category: 'Supporto',
      icon: 'fa-headset',
      deliveryTime: '1-2 giorni lavorativi',
      revisions: 'Illimitate'
    },
    {
      id: 'volantini',
      name: 'Creazione Volantini',
      description: 'Design professionale di volantini pubblicitari per la tua attività.',
      price: 9.90,
      category: 'Grafica',
      icon: 'fa-paint-brush',
      deliveryTime: '2-4 giorni lavorativi',
      revisions: '2 revisioni gratuite'
    }
  ]);
  
  // Seed degli utenti
  await UserModel.bulkCreate([
    {
      nome: 'SIMONE',
      cognome: 'Rixolino',
      email: 'elrisolix.erx@outlook.com',
      password: '$2b$10$Ospmp1.8H98CTqVpc5LzHO5P3DoxR8X1WZ3z3/3Tv0OCLc2uirNsG',
      isAdmin: true,
      puntifedelta: 0,
      settings: JSON.stringify({ 
        fontSize: 2, 
        highContrast: false, 
        reduceAnimations: false, 
        colorBlindMode: 'none',
        theme: 'light'
      })
    },
    {
      nome: 'SIMONa',
      cognome: 'Rixolino',
      email: 'simonerisola.sr@gmail.com',
      password: '$2b$10$S11T16Can5g0/Re6B75RDuYgIKDSp4rOtDDumGR6/vweKeeydARce',
      isAdmin: false,
      puntifedelta: 0,
      settings: JSON.stringify({ 
        fontSize: 1, 
        highContrast: false, 
        reduceAnimations: false, 
        colorBlindMode: 'none',
        theme: 'dark'
      })
    }
  ]);
  
  // Seed delle impostazioni
  const users = await UserModel.findAll();
  for (const user of users) {
    await SettingsModel.create({
      user_id: user.id,
      fontSize: user.id === 1 ? 2 : 1,
      theme: user.id === 1 ? 'light' : 'dark',
      primaryColor: user.id === 1 ? 'default' : 'red',
      emailNotifications: true,
      orderUpdates: true
    });
  }
};

syncDatabase();