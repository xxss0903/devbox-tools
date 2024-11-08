import { DataTypes, Model, Sequelize } from 'sequelize'

export interface ProjectAttributes {
  id: string
  name: string
  path: string
  description?: string
  createTime: string
  updateTime: string
  isFavorite: boolean
  isArchived: boolean
}

export class Project extends Model<ProjectAttributes> implements ProjectAttributes {
  public id!: string
  public name!: string
  public path!: string
  public description!: string
  public createTime!: string
  public updateTime!: string
  public isFavorite!: boolean
  public isArchived!: boolean

  public static initModel(sequelize: Sequelize): void {
    Project.init(
      {
        id: {
          type: DataTypes.STRING,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        path: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        createTime: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        updateTime: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        isFavorite: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        isArchived: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        modelName: 'Project',
        timestamps: false,
      }
    )
  }
} 