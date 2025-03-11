import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id?: number;
  nome: string;
  cognome: string;
  email: string;
  password: string;
  telefono?: string;
  indirizzo?: string;
  isAdmin: boolean;
  puntifedelta: number;
  isDeleted: boolean;
  settings?: any; // Aggiunto il campo settings come JSON
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public nome!: string;
  public cognome!: string;
  public email!: string;
  public password!: string;
  public telefono?: string;
  public indirizzo?: string;
  public isAdmin!: boolean;
  public puntifedelta!: number;
  public isDeleted!: boolean;
  public settings?: any; // Aggiunto il campo settings come JSON

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Metodo per confrontare la password
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cognome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true
  },
  indirizzo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  puntifedelta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  settings: {
    type: DataTypes.JSON,  // Usa TEXT se hai problemi con JSON
    allowNull: true,
    defaultValue: {}
  }
}, {
  sequelize,
  tableName: 'utenti',
  modelName: 'User',
  hooks: {
    beforeCreate: async (user: User) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user: User) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

export default User;