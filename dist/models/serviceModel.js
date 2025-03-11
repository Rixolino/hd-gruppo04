"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class Service extends sequelize_1.Model {
    // Getter che assicura che price sia sempre un numero
    get formattedPrice() {
        return parseFloat(this.getDataValue('price'));
    }
}
Service.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
            const value = this.getDataValue('price');
            return value === null ? null : parseFloat(value);
        }
    },
    category: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    icon: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    deliveryTime: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    revisions: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize: db_1.sequelize,
    tableName: 'services',
    timestamps: true
});
exports.default = Service;
