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
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class User extends sequelize_1.Model {
    // Metodo per confrontare la password
    comparePassword(candidatePassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcryptjs_1.default.compare(candidatePassword, this.password);
        });
    }
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    cognome: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    telefono: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    indirizzo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    isAdmin: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    puntifedelta: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    isDeleted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    settings: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    }
}, {
    sequelize: db_1.sequelize,
    tableName: 'utenti',
    modelName: 'User',
    hooks: {
        beforeCreate: (user) => __awaiter(void 0, void 0, void 0, function* () {
            if (user.password) {
                const salt = yield bcryptjs_1.default.genSalt(10);
                user.password = yield bcryptjs_1.default.hash(user.password, salt);
            }
        }),
        beforeUpdate: (user) => __awaiter(void 0, void 0, void 0, function* () {
            if (user.changed('password')) {
                const salt = yield bcryptjs_1.default.genSalt(10);
                user.password = yield bcryptjs_1.default.hash(user.password, salt);
            }
        })
    }
});
exports.default = User;
