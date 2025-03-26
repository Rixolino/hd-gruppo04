import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';
import User from './userModel';

export interface OrderAttributes {
  id?: number;
  utenteId: number;
  servizio: string;
  prezzo: number;
  stato: string;
  dataRichiesta: Date;
  progressoLavoro: number;
  dataConsegna?: Date;
  titolo: string; // Add appropriate title
  descrizione: string; // Add appropriate description
  dettagliAggiuntivi: string; // Add appropriate additional details
}

class Order extends Model<OrderAttributes> implements OrderAttributes {
  public id!: number;
  public utenteId!: number;
  public servizio!: string;
  public descrizione!: string;
  public dettagliAggiuntivi!: string;
  public stato!: string;
  public dataRichiesta!: Date;
  public dataConsegna?: Date;
  public prezzo!: number;
  public progressoLavoro!: number;
  public titolo!: string;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  utenteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'utenti',
      key: 'id'
    }
  },
  servizio: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descrizione: {
    type: DataTypes.TEXT,
    allowNull: true // Modifica secondo necessità
  },
  dettagliAggiuntivi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  stato: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'in-attesa'
  },
  dataRichiesta: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  dataConsegna: {
    type: DataTypes.DATE,
    allowNull: true
  },
  prezzo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  progressoLavoro: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  titolo: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'ordini',
  modelName: 'Order'
});

// Relazione con l'utente
Order.belongsTo(User, { foreignKey: 'utenteId' });
User.hasMany(Order, { foreignKey: 'utenteId' });

export default Order;