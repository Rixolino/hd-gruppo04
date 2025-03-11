"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const promise_1 = require("mysql2/promise");
dotenv_1.default.config();

const createDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield (0, promise_1.createConnection)({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3307'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });
    yield connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    yield connection.end();
});

// Usa direttamente i parametri dal file .env invece di DATABASE_URL
const sequelize = new sequelize_1.Sequelize(
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
exports.sequelize = sequelize;

const initializeDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verifica la connessione
        yield sequelize.authenticate();
        console.log('Connessione al database stabilita con successo.');
        
        // Sincronizza i modelli con il database
        yield sequelize.sync();
        console.log('Tabelle create o aggiornate con successo.');
    } catch (error) {
        console.error('Impossibile connettersi al database:', error);
    }
});
exports.initializeDatabase = initializeDatabase;