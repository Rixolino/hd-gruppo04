const bcrypt = require('bcrypt');
const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname, 'database.sqlite'),
  logging: false
});

// Definizione modello User
const User = sequelize.define('User', {
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  tableName: 'Users'
});

async function createUser() {
  try {
    // Genera hash della password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('as', salt);
    
    // Crea utente
    await User.create({
      username: 'rixolino',
      email: 'rixolino@outlook.com',
      password: hashedPassword
    });
    
    console.log('Utente creato con successo!');
    process.exit(0);
  } catch (error) {
    console.error('Errore durante la creazione dell\'utente:', error);
    process.exit(1);
  }
}

createUser();
