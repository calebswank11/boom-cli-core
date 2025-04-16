import { ConfigRegistry } from '../../registries';
import { DataServicesBase, Orm, ORMEnum } from '../../@types';
import { KnexServiceBuilder } from './node/KnexServiceBuilder';
import { SequelizeServiceBuilder } from './node/SequelizeServiceBuilder';
import { TypeORMServiceBuilder } from './node/TypeORMServiceBuilder';
import { PrismaServiceBuilder } from './node/PrismaServiceBuilder';

export class DataServiceBuilder {
  static getBuilder(orm: Orm){
    switch (orm) {
      case ORMEnum.knex: {
        return KnexServiceBuilder;
      }
      case ORMEnum.sequelize: {
        return SequelizeServiceBuilder;
      }
      case ORMEnum.prisma: {
        return PrismaServiceBuilder;
      }
      case ORMEnum.typeorm: {
        return TypeORMServiceBuilder;
      }
      default:
        console.error('⚠️ ORM not supported, skipping data services creation.');
        return null;
    }
  }
}
