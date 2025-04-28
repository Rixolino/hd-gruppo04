import { sequelize } from '../config/db';
import { Model, DataTypes } from 'sequelize';

class Notifica extends Model {
  public id!: number;
  public tipo!: string;
  public messaggio!: string;
  public letto!: boolean;
  public data!: Date;
  public utenteId!: number | null;  // ID dell'utente a cui è destinata la notifica
  public entityId!: number | null;  // ID dell'entità correlata (es. ordine)
  public entityType!: string | null; // Tipo di entità correlata (es. 'ordine')
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notifica.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  tipo: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  messaggio: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  letto: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  data: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  utenteId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'notifiche',
  modelName: 'Notifica'
});

export default Notifica;