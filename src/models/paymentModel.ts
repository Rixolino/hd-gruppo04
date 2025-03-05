import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

// Definisci l'interfaccia per il modello
interface IPaymentAttributes {
    id?: number;
    amount: number;
    serviceId: string;
    userId: string;
    status: string;
}

// Definisci l'interfaccia per la creazione del modello
interface IPaymentCreationAttributes extends Optional<IPaymentAttributes, 'id'> {}

// Definisci il modello
class Payment extends Model<IPaymentAttributes, IPaymentCreationAttributes> implements IPaymentAttributes {
    public id!: number;
    public amount!: number;
    public serviceId!: string;
    public userId!: string;
    public status!: string;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Inizializza il modello
Payment.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        serviceId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'payments',
        timestamps: true,
    }
);

export default Payment;