"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAssociations = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const userModel_1 = __importDefault(require("./userModel"));
// Definisci la classe del modello Settings
class SettingsModel extends sequelize_1.Model {
}
// Inizializza il modello Settings
SettingsModel.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'utenti',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    // Impostazioni di accessibilità
    fontSize: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 1
    },
    highContrast: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    reduceAnimations: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    colorBlindMode: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'none'
    },
    // Impostazioni di personalizzazione
    theme: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'light'
    },
    primaryColor: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'default'
    },
    layout: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'default'
    },
    // Impostazioni notifiche
    emailNotifications: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    orderUpdates: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    promotions: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    newsletter: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Impostazioni privacy
    dataTelemetry: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    cookies: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: db_1.sequelize,
    tableName: 'settings',
    timestamps: true
});
// Esporta il modello
exports.default = SettingsModel;
// Inizializza le associazioni dopo l'export per evitare dipendenze circolari
const initAssociations = () => {
    // Relazione con l'utente (uno a uno)
    SettingsModel.belongsTo(userModel_1.default, { foreignKey: 'user_id' });
    userModel_1.default.hasOne(SettingsModel, { foreignKey: 'user_id' });
};
exports.initAssociations = initAssociations;
