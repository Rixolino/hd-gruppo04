import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// Definisci l'interfaccia per il modello
interface IPaymentAttributes {
    id?: number;
    orderId: number;
    utenteId: number;
    importo: number;
    metodo: string;
    stato: string;
    riferimento: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Definisci l'interfaccia per la creazione del modello
interface IPaymentCreationAttributes extends Optional<IPaymentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Definisci il modello
class PaymentModel extends Model<IPaymentAttributes, IPaymentCreationAttributes> implements IPaymentAttributes {
    public id!: number;
    public orderId!: number;
    public utenteId!: number;
    public importo!: number;
    public metodo!: string;
    public stato!: string;
    public riferimento!: string;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Inizializza il modello
PaymentModel.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        orderId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        utenteId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        importo: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        metodo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        stato: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        riferimento: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        sequelize,
        tableName: 'payments',
        timestamps: true,
    }
);

export default PaymentModel;