import { ORMEnum } from '../../@types';
import { SequelizeModelBuilder } from './libraries/sequelizeModelBuilder';

export class ModelBuilder {
  static getBuilder(orm: ORMEnum) {
    switch (orm) {
      case ORMEnum.sequelize:
        return SequelizeModelBuilder;
    }
  }
}
