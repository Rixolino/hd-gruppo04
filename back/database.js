require('dotenv').config();

console.log('Loading database configuration with host:', process.env.DB_HOST);

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3307,
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    dialectOptions: {
      connectTimeout: 60000
    }
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3307,
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    dialectOptions: {
      connectTimeout: 60000
    }
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3307,
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    dialectOptions: {
      connectTimeout: 60000
    }
  }
};