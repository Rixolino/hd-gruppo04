const net = require('net');
require('dotenv').config();

// Estrai i parametri dal file .env
const host = process.env.DB_HOST;
const port = process.env.DB_PORT || '3307';

console.log(`Tentativo di connessione a ${host}:${port}...`);
console.log('Variabili d\'ambiente caricate:', {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_DATABASE: process.env.DB_DATABASE,
  DB_USERNAME: process.env.DB_USERNAME
});

// Crea una connessione TCP semplice per verificare che il server risponda
const client = net.createConnection({ host, port }, () => {
  console.log('Connessione riuscita! Il server database è raggiungibile.');
  // Chiudi immediatamente la connessione
  client.end();
});

client.on('error', (err) => {
  console.error('Errore di connessione:', err.message);
});

// Imposta un timeout di 5 secondi
client.setTimeout(5000, () => {
  console.error('Timeout della connessione');
  client.destroy();
});