import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';

class User extends Model {
    public id!: number;
    public name!: string;
    public email!: string;
    public password!: string;
}

User.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: new DataTypes.STRING(255),
        allowNull: false,
    },
    email: {
        type: new DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    password: {
        type: new DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    tableName: 'users',
    sequelize,
});

const initializeUserModel = async () => {
    await User.sync(); // Questo creerà la tabella se non esiste
    return User;
};

export default initializeUserModel;