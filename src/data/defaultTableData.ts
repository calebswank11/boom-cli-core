import { SqlDataType, TableColumnStructureBase } from '../@types';

export const defaultTableData: {
  defaultColumns: Record<string, TableColumnStructureBase>;
} = {
  defaultColumns: {
    id: {
      name: 'id',
      pascalCase: 'id',
      camelCase: 'id',
      capSentenceCase: 'ID',
      autoIncrement: false,
      type: {
        name: SqlDataType.UUID,
      },
      primary: true,
      unique: true,
      nullable: false,
    },
    created_at: {
      name: 'created_at',
      pascalCase: 'CreatedAt',
      camelCase: 'createdAt',
      capSentenceCase: 'Created At',
      autoIncrement: false,
      type: {
        name: SqlDataType.TIMESTAMP,
      },
      primary: false,
      unique: false,
      nullable: true,
      default: 'NOW()',
    },
    updated_at: {
      name: 'updated_at',
      pascalCase: 'UpdateAt',
      camelCase: 'updatedAt',
      capSentenceCase: 'Updated At',
      autoIncrement: false,
      type: {
        name: SqlDataType.TIMESTAMP,
      },
      primary: false,
      unique: false,
      nullable: true,
      default: 'NOW()',
    },
    deleted_at: {
      name: 'deleted_at',
      pascalCase: 'DeletedAt',
      camelCase: 'deletedAt',
      capSentenceCase: 'Deleted At',
      autoIncrement: false,
      type: {
        name: SqlDataType.TIMESTAMP,
      },
      primary: false,
      unique: false,
      nullable: true,
    },
  },
};
