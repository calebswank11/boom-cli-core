import { Orm, ORMEnum } from '../../@types';
import {
  KnexMigrationFactory,
  PrismaMigrationFactory,
  SequelizeMigrationFactory,
  TypeORMMigrationFactory,
} from './node';

export class MigrationFactory {
  static getMigrationFactory(ormType: Orm) {
    switch (ormType) {
      case ORMEnum.knex:
        return KnexMigrationFactory;
      case ORMEnum.prisma:
        return PrismaMigrationFactory;
      case ORMEnum.sequelize:
        return SequelizeMigrationFactory;
      case ORMEnum.typeorm:
        return TypeORMMigrationFactory;
    }
  }
}
