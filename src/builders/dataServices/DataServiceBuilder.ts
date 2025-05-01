import { Orm, ORMEnum } from '../../@types';
import { logRepoIssuesLink } from '../../utils/logs';
import { KnexServiceBuilder } from './node/KnexServiceBuilder';
import { PrismaServiceBuilder } from './node/PrismaServiceBuilder';
import { SequelizeServiceBuilder } from './node/SequelizeServiceBuilder';
import { TypeORMServiceBuilder } from './node/TypeORMServiceBuilder';

export class DataServiceBuilder {
  static getBuilder(orm: Orm) {
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
        console.error(
          '⚠️ ORM not supported, skipping data services creation. Open an issue on github to request',
        );
        logRepoIssuesLink();
        return null;
    }
  }
}
