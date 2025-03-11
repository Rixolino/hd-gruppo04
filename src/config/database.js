module.exports = {
  development: {
    dialect: 'mysql',
    username: 'root', // Cambia con il tuo username
    password: '', // Cambia con la tua password
    database: 'HD-Gruppo04',
    host: '127.0.0.1',
    logging: false,
  },
  test: {
    dialect: 'mysql',
    username: 'root',
    password: '',
    database: 'HD-Gruppo04_test',
    host: '127.0.0.1',
    logging: false,
  },
  production: {
    dialect: 'mysql',
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    logging: false,
  }
};