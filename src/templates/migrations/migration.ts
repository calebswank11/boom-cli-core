import { ORMEnum } from '../../@types';
import { knexMigrationsTemplate } from './knexMigrationTemplate';
import { sequelizeMigrationsTemplate } from './sequelizeMigrationTemplate';
import { prismaMigrationsTemplate } from './prismaMigrationTemplate';
import { typeORMMigrationsTemplate } from './typeORMMigrationTemplate';

export const getMigrationsTemplate = (orm: ORMEnum) => {
  switch (orm) {
    case ORMEnum.knex:
      return knexMigrationsTemplate;
    case ORMEnum.sequelize:
      return sequelizeMigrationsTemplate;
    case ORMEnum.prisma:
      return prismaMigrationsTemplate;
    case ORMEnum.typeorm:
      return typeORMMigrationsTemplate;
      default: return null;
  }
};
