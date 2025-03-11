"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
// Definisci il modello
class Payment extends sequelize_1.Model {
}
// Inizializza il modello
Payment.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    amount: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    serviceId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: db_1.sequelize,
    tableName: 'payments',
    timestamps: true,
});
exports.default = Payment;
