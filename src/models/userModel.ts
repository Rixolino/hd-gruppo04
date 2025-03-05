import sequelize from '../config/db';
import { DataTypes, Model } from 'sequelize';

const User = sequelize.define('User', {
  // Definizione del modello utente
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const initializeUserModel = async (): Promise<typeof User> => {
  await User.sync(); // Sincronizza il modello con il database
  return User;
};

export { User };
export default initializeUserModel;