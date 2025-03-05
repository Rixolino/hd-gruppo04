import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db'; // Assicurati di avere un file di configurazione per il database

// Definisci l'interfaccia per il modello
interface IServiceAttributes {
    userId: string;
    serviceId: string;
    details: string;
    status: string;
}

// Definisci l'interfaccia per la creazione del modello
interface IServiceCreationAttributes extends Optional<IServiceAttributes, 'serviceId'> {}

// Definisci il modello
class Service extends Model<IServiceAttributes, IServiceCreationAttributes> implements IServiceAttributes {
    public userId!: string;
    public serviceId!: string;
    public details!: string;
    public status!: string;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Inizializza il modello
Service.init(
    {
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        serviceId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        details: {
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
        tableName: 'services',
        timestamps: true,
    }
);

export default Service;