import { SqlDataType, TableColumnStructureBase } from '../@types';

export const defaultTableData: {
  defaultColumns: Record<string, TableColumnStructureBase>;
} = {
  defaultColumns: {
    id: {
      name: 'id',
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
