import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';
import User from './userModel';

export interface OrderAttributes {
  id?: number;
  utenteId: number;
  servizio: number;
  descrizione: string;
  dettagliAggiuntivi: string;
  stato: string;
  dataRichiesta: Date;
  dataConsegna?: Date;
  prezzo: number;
  progressoLavoro: number;
}

class Order extends Model<OrderAttributes> implements OrderAttributes {
  public id!: number;
  public utenteId!: number;
  public servizio!: number;
  public descrizione!: string;
  public dettagliAggiuntivi!: string;
  public stato!: string;
  public dataRichiesta!: Date;
  public dataConsegna?: Date;
  public prezzo!: number;
  public progressoLavoro!: number;
  
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
    type: DataTypes.INTEGER,
    allowNull: false
  },
  descrizione: {
    type: DataTypes.TEXT,
    allowNull: false
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