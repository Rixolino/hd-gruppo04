import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// Definizione dell'interfaccia per gli attributi del modello Payment
export interface IPaymentAttributes {
  id: number;
  orderId: number;  // Assicurati che questo campo sia presente
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
  public orderId!: number;  // Assicurati che questo campo sia presente
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

// Inizializza il modello con la mappatura corretta ai campi del database
PaymentModel.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'orderId'  // Esplicita il mapping (anche se identico)
  },
  utenteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'userId' 
  },
  importo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'amount'
  },
  servizio: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'serviceId'
  },
  metodo: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'paymentMethod'
  },
  stato: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'status'
  },
  riferimento: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'transactionId'
  },
  dettagli: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'details'
  }
}, {
  sequelize,
  tableName: 'payments',
  timestamps: true
});

export default PaymentModel;