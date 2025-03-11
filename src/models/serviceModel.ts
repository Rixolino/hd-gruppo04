import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

class Service extends Model {
  public id!: string;
  public name!: string;
  public description!: string;
  public price!: number;
  public category!: string;
  public icon!: string;
  public deliveryTime!: string;
  public revisions!: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  
  // Getter che assicura che price sia sempre un numero
  get formattedPrice() {
    return parseFloat(this.getDataValue('price'));
  }
}

Service.init({
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    get() {
      const value = this.getDataValue('price');
      return value === null ? null : parseFloat(value);
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deliveryTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  revisions: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'services',
  timestamps: true
});

export default Service;