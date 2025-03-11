import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';
import UserModel from './userModel';

// Definisci l'interfaccia per l'istanza del modello Settings
interface SettingsAttributes {
  id?: number;
  user_id: number;
  // Impostazioni di accessibilità
  fontSize?: number;
  highContrast?: boolean;
  reduceAnimations?: boolean;
  colorBlindMode?: string;
  // Impostazioni di personalizzazione
  theme?: string;
  primaryColor?: string;
  layout?: string;
  // Impostazioni di notifica
  emailNotifications?: boolean;
  orderUpdates?: boolean; // Aggiunto
  promotions?: boolean;   // Aggiunto
  newsletter?: boolean;   // Aggiunto
  // Impostazioni di privacy
  dataTelemetry?: boolean; // Aggiunto
  cookies?: boolean;      // Aggiunto
  // Timestamp
  createdAt?: Date;
  updatedAt?: Date;
}

// Definisci la classe del modello Settings
class SettingsModel extends Model<SettingsAttributes> implements SettingsAttributes {
  public id!: number;
  public user_id!: number;
  public fontSize!: number;
  public highContrast!: boolean;
  public reduceAnimations!: boolean;
  public colorBlindMode!: string;
  public theme!: string;
  public primaryColor!: string;
  public layout!: string;
  public emailNotifications!: boolean;
  public orderUpdates!: boolean;
  public promotions!: boolean;
  public newsletter!: boolean;
  public dataTelemetry!: boolean;
  public cookies!: boolean;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Inizializza il modello Settings
SettingsModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'utenti',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    
    // Impostazioni di accessibilità
    fontSize: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    highContrast: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reduceAnimations: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    colorBlindMode: {
      type: DataTypes.STRING,
      defaultValue: 'none'
    },
    
    // Impostazioni di personalizzazione
    theme: {
      type: DataTypes.STRING,
      defaultValue: 'light'
    },
    primaryColor: {
      type: DataTypes.STRING,
      defaultValue: 'default'
    },
    layout: {
      type: DataTypes.STRING,
      defaultValue: 'default'
    },
    
    // Impostazioni notifiche
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    orderUpdates: {  // Aggiunto
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    promotions: {  // Aggiunto
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    newsletter: {  // Aggiunto
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    
    // Impostazioni privacy
    dataTelemetry: {  // Aggiunto
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    cookies: {  // Aggiunto
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'settings',
    timestamps: true
  }
);

// Esporta il modello
export default SettingsModel;

// Inizializza le associazioni dopo l'export per evitare dipendenze circolari
export const initAssociations = (): void => {
  // Relazione con l'utente (uno a uno)
  SettingsModel.belongsTo(UserModel, { foreignKey: 'user_id' });
  UserModel.hasOne(SettingsModel, { foreignKey: 'user_id' });
};