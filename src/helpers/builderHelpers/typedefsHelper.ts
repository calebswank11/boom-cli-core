import { GraphQLField, GraphQLFieldTypeBase } from '../../@types';

const baseStringResponse = (colName: string, nullable?: boolean) => ({
  type: GraphQLField.GraphQLString,
  key: colName,
  nullable: !!nullable,
});

const baseIntResponse = (colName: string, nullable?: boolean) => ({
  type: GraphQLField.GraphQLInt,
  key: colName,
  nullable: !!nullable,
});

const baseFloatResponse = (colName: string, nullable?: boolean) => ({
  type: GraphQLField.GraphQLFloat,
  key: colName,
  nullable: !!nullable,
});

const baseBooleanResponse = (colName: string, nullable?: boolean) => ({
  type: GraphQLField.GraphQLBoolean,
  key: colName,
  nullable: !!nullable,
});

export const typedefsTypeParsers: Record<
  string,
  (
    colName: string,
    nullable?: boolean,
    enumName?: string,
    enumFields?: string[],
  ) => GraphQLFieldTypeBase
> = {
  VARCHAR: baseStringResponse,
  UUID: baseStringResponse,
  JSONB: baseStringResponse,
  DATE: baseStringResponse,
  TIMESTAMP: baseStringResponse,
  TIME: baseStringResponse,
  INT: baseIntResponse,
  FLOAT: baseFloatResponse,
  DECIMAL: baseFloatResponse,
  NUMERIC: baseFloatResponse,
  ENUM: (colName, nullable, enumName, enumFields) => ({
    key: colName,
    type: GraphQLField.GraphQLEnumType,
    nullable: !!nullable,
    enums: { enumName: enumName as string, fields: enumFields as string[] },
  }),
  BOOLEAN: baseBooleanResponse,
  TEXT: baseStringResponse,
};
