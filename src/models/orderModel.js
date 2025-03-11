"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const userModel_1 = __importDefault(require("./userModel"));
class Order extends sequelize_1.Model {
}
Order.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    utenteId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'utenti',
            key: 'id'
        }
    },
    servizio: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    stato: {
        type: sequelize_1.DataTypes.ENUM('in-attesa', 'pagamento-in-attesa', 'in-lavorazione', 'completato'),
        allowNull: false,
        defaultValue: 'in-attesa'
    },
    dataRichiesta: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    dataConsegna: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    prezzo: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    progressoLavoro: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    sequelize: db_1.sequelize,
    tableName: 'ordini',
    modelName: 'Order'
});
// Relazione con l'utente
Order.belongsTo(userModel_1.default, { foreignKey: 'utenteId' });
userModel_1.default.hasMany(Order, { foreignKey: 'utenteId' });
exports.default = Order;
