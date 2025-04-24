import { MigrationsBase } from '../../@types';

export const typeORMMigrationsTemplate = ({
  tablesToCreate,
  enumsToCreate,
  tablesToDrop,
  enumsToImport,
  enumPath,
  name,
}: MigrationsBase & { enumPath: string; name: string }) => ``;
