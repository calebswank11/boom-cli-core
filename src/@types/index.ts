import { ReadEndpointTypes, WriteEndpointTypes } from './endpoints';
import { APIArgument, SqlDataType } from './dataRegistry';

export interface MigrationsBase {
  tablesToCreate: string[];
  tablesToDrop: string[];
  enumsToCreate: string[];
  enumsToImport: string[];
}

export interface SeedReference {
  refTable: string;
  column: string;
  type: string;
  key: string;
}
export interface SeedField {
  column: string;
  type: SqlDataType;
}
export interface SeedEnum {
  column: string; // columnName,
  values: string[]; // values of the enum to populate
}
export interface SeedConstraints {
  column: string;
  type: string;
}
export interface SeedBase {
  tableName: string;
  references: SeedReference[]; // references these, fetch id's first
  fields: SeedField[]; // table fields to populate
  requiredFields: string[];
  enums: SeedEnum[];
  constraints: SeedConstraints[];
}

export interface TypescriptBase {
  contents: string;
  enums: string[];
}

export enum GraphQLField {
  GraphQLString = 'GraphQLString',
  GraphQLInt = 'GraphQLInt',
  GraphQLFloat = 'GraphQLFloat',
  GraphQLBoolean = 'GraphQLBoolean',
  GraphQLID = 'GraphQLID',
  GraphQLEnumType = 'GraphQLEnumType',
}

export interface GraphQLFieldTypeBase {
  key: string;
  type: GraphQLField;
  nullable?: boolean;
  list?: boolean;
  enums?: { enumName: string; fields: string[] };
}

export interface TypedefsBase {
  name: string;
  description: string;
  fields: GraphQLFieldTypeBase[];
}

export type APIHelperFunctionBase = {
  functionName: string;
  functionArgs: string[];
  typescriptType: string | null;
  constName: string;
  folder: string;
};

export interface APINameBase {
  prefix: string;
  suffix: string;
  name: string;
}

export type DataServicesBase = {
  type: ReadEndpointTypes | WriteEndpointTypes | string;
  apiName: APINameBase;
  args: APIArgument[];
} & APIHelperFunctionBase;

export type SeedsRegistryBase = { name: string; seeds: SeedBase[] };

export type MigrationsRegistryBase = { name: string; migrations: MigrationsBase };

export interface PackageRegistryBase {
  scripts: {
    library: {
      ts: Record<string, string>;
      js: Record<string, string>;
      general: Record<string, string>;
    };
    orm: {
      knex: Record<string, string>;
      sequelize: Record<string, string>;
      typeorm: Record<string, string>;
      prisma: Record<string, string>;
    };
  };
  dependencies: {
    general: Record<string, string>;
    api: {
      type: {
        graphql: Record<string, string>;
      };
      handler: {
        general: Record<string, string>;
        apollo: Record<string, string>;
      };
    };
    library: {
      general: Record<string, string>;
      express: Record<string, string>;
    };
    orm: {
      general: Record<string, string>;
      knex: Record<string, string>;
      sequelize: Record<string, string>;
      typeorm: Record<string, string>;
      prisma: Record<string, string>;
    };
  };
  devDependencies: {
    general: {
      ts: Record<string, string>;
      [key: string]: string | Record<string, string>;
    };
    api: {
      type: {
        graphql: {
          ts: Record<string, string>;
        };
      };
      handler: {
        apollo: {
          general: Record<string, string>;
          ts: Record<string, string>;
        };
      };
    };
    library: {
      express: {
        ts: Record<string, string>;
      };
    };
    orm: {
      knex: { ts: Record<string, string> };
      sequelize: {
        ts: Record<string, string>;
        js: Record<string, string>;
      };
      typeorm: Record<string, string>;
      prisma: Record<string, string>;
    };
  };
}

export * from './endpoints';
export * from './scaffoldingConfig';
export * from './dataRegistry';
export * from './templates';
export * from './dynamo';
export * from './constants';
export * from './cli.types';
export * from './builders';
