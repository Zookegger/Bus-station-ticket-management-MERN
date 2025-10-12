import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface RouteAttributes {
  id: number;
  startId: number;
  destinationId: number;
  distance?: number | null;
  duration?: number | null;
  price?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RouteCreationAttributes extends Optional<RouteAttributes, 'id' | 'distance' | 'duration' | 'price' | 'createdAt' | 'updatedAt'> {}

export class Route extends Model<RouteAttributes, RouteCreationAttributes> implements RouteAttributes {
  public id!: number;
  public startId!: number;
  public destinationId!: number;
  public distance?: number | null;
  public duration?: number | null;
  public price?: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize) {
    Route.init(
      {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        startId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        destinationId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        distance: { type: DataTypes.FLOAT, allowNull: true },
        duration: { type: DataTypes.FLOAT, allowNull: true },
        price: { type: DataTypes.DECIMAL(10, 2), allowNull: true }
      },
      {
        sequelize,
        tableName: 'routes',
        timestamps: true
      }
    );
  }
}