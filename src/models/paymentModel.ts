import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// Definizione dell'interfaccia per gli attributi del modello Payment
export interface IPaymentAttributes {
  id: number;
  orderId: number;
  utenteId: number;
  importo: number;
  servizio: number;
  metodo: string;
  stato: string;
  riferimento: string;
  dettagli?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Attributi opzionali durante la creazione
export interface IPaymentCreationAttributes extends Optional<IPaymentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Definisci la classe del modello che estende Model con le interfacce
class PaymentModel extends Model<IPaymentAttributes, IPaymentCreationAttributes> implements IPaymentAttributes {
  public id!: number;
  public orderId!: number;
  public utenteId!: number;
  public importo!: number;
  public servizio!: number;
  public metodo!: string;
  public stato!: string;
  public riferimento!: string;
  public dettagli?: string;
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Inizializza il modello
PaymentModel.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  utenteId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  importo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  servizio: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  metodo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  stato: {
    type: DataTypes.STRING,
    allowNull: false
  },
  riferimento: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dettagli: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'payments',
  timestamps: true
});

export default PaymentModel;