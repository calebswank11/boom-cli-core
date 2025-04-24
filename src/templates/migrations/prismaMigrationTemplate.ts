import { MigrationsBase } from '../../@types';

export const prismaMigrationsTemplate = ({
  tablesToCreate,
  enumsToCreate,
  tablesToDrop,
  enumsToImport,
  enumPath,
  name,
}: MigrationsBase & { enumPath: string; name: string }) => ``;
