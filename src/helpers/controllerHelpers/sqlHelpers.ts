import { extractEnumValues, snakeToCamel } from '../../utils/stringUtils';
import { TableColumnTypeBase, ValidationRule } from '../../@types';

export function inferExampleFromSql(
  name: string,
  type: string,
  enumValues?: string[],
  defaultValue?: any,
): any {
  if (defaultValue) return defaultValue;
  if (enumValues?.length) return enumValues[0];

  name = name.toLowerCase();
  if (name === 'email') return 'user@example.com';
  if (name === 'phone') return '+1234567890';
  if (name.includes('uuid') || type === 'UUID')
    return '550e8400-e29b-41d4-a716-446655440000';
  if (name.includes('date') || type.includes('TIMESTAMP'))
    return new Date().toISOString();

  switch (type) {
    case 'BOOLEAN':
      return true;
    case 'INT':
      return 42;
    case 'DECIMAL':
      return 99.99;
    case 'VARCHAR':
      return 'example';
    default:
      return 'sample';
  }
}

export function inferDescriptionFromSql(
  colName: string,
  enumValues?: string[],
): string | undefined {
  const name = colName.toLowerCase();

  if (name === 'email') return 'Email address of the user';
  if (name.includes('password') || name.includes('pass'))
    return 'Hashed user password';
  if (name.endsWith('_id')) return `Reference to a ${name.replace(/_id$/, '')}`;
  if (name.includes('created_at')) return 'Timestamp when the record was created';
  if (name.includes('updated_at'))
    return 'Timestamp when the record was last updated';
  if (name.includes('deleted_at')) return 'Timestamp when the record was deleted';
  if (name === 'status' || name.includes('status')) return 'Status of the record';
  if (name === 'phone' || name.includes('phone'))
    return 'Phone number in international format';
  if (name === 'username') return 'Username for login';
  if (name === 'first_name') return "User's first name";
  if (name === 'last_name') return "User's last name";
  if (name.includes('name')) return 'Name of the entity';

  if (
    name.includes('type') ||
    name.includes('category') ||
    name.includes('level') ||
    name.includes('scope') ||
    name.includes('kind') ||
    name.includes('role') ||
    name.includes('connection')
  ) {
    return 'Type of classification or grouping';
  }

  if (enumValues?.length) return `One of: ${enumValues.join(', ')}`;

  return `The ${name.replace(/_/g, ' ')} field`;
}
export function generateValidationRules(
  colName: string,
  typeName: string,
  columnType: Partial<TableColumnTypeBase>,
  enumValues?: string[],
  required?: boolean,
): ValidationRule[] {
  const rules: ValidationRule[] = [];
  const name = colName.toLowerCase();
  const sqlType = typeName.toUpperCase();

  if (sqlType.includes('VARCHAR') || sqlType.includes('TEXT')) {
    if (columnType.limit) {
      rules.push({
        type: 'maxLength',
        value: columnType.limit,
        message: `Must be at most ${columnType.limit} characters`,
        customValidator: 'length_check',
        required,
      });
    }
    if (name.includes('email')) {
      rules.push({
        type: 'pattern',
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Must be a valid email address',
        customValidator: 'email',
        required,
      });
    }
    if (name.includes('phone')) {
      rules.push({
        type: 'pattern',
        value: /^\+?[0-9]{7,15}$/,
        message: 'Must be a valid phone number',
        customValidator: 'phone',
        required,
      });
    }
  }

  if (
    sqlType.includes('DECIMAL') ||
    sqlType.includes('NUMERIC') ||
    sqlType.includes('INT')
  ) {
    if (columnType.precision !== undefined) {
      rules.push({
        type: 'max',
        value: Math.pow(10, columnType.precision) - 1,
        message: `Must be less than ${Math.pow(10, columnType.precision)}`,
        customValidator: 'between_numbers',
        required,
      });
    }
  }

  if (sqlType.includes('ENUM') && enumValues?.length) {
    rules.push({
      type: 'pattern',
      value: `^(${enumValues.join('|')})$`,
      message: `Must be one of: ${enumValues.join(', ')}`,
      customValidator: 'enum_check',
    });
  }

  return rules;
}

export const sqlTypeParsers: Record<
  string,
  (colType: string, colName: string, tableName?: string) => any
> = {
  VARCHAR: (colType, colName) => {
    const sizeMatch = colType.match(/\((\d+)\)/);
    return {
      name: colName,
      type: { name: 'VARCHAR', limit: sizeMatch ? parseInt(sizeMatch[1], 10) : 255 },
      inputType: 'text',
    };
  },
  UUID: (colType, colName) => ({ name: colName, type: { name: 'UUID' } }),
  JSONB: (colType, colName) => ({
    name: colName,
    type: { name: 'JSONB' },
    inputType: 'textarea',
  }),
  DATE: (colType, colName) => ({
    name: colName,
    type: { name: 'DATE' },
    inputType: 'date',
  }),
  TIMESTAMP: (colType, colName) => ({
    name: colName,
    type: { name: 'TIMESTAMP' },
    inputType: 'date',
  }),
  TIME: (colType, colName) => ({
    name: colName,
    type: { name: 'TIME' },
    inputType: 'date',
  }),
  INT: (colType, colName) => ({
    name: colName,
    type: { name: 'INT' },
    inputType: 'number',
  }),
  FLOAT: (colType, colName) => ({
    name: colName,
    type: { name: 'FLOAT' },
    inputType: 'number',
  }),
  NUMERIC: (colType, colName) => {
    const match = colType.match(/\s*\((\d+)\s*,\s*(\d+)\s*\)/);

    return {
      name: colName,
      type: {
        name: 'NUMERIC',
        precision: match ? parseInt(match[1], 10) : 10,
        scale: match ? parseInt(match[2], 10) : 0,
      },
      inputType: 'number',
    };
  },
  DECIMAL: (colType, colName) => {
    const match = colType.match(/\s*\((\d+)\s*,\s*(\d+)\s*\)/);
    return {
      name: colName,
      type: {
        name: 'DECIMAL',
        precision: match ? parseInt(match[1], 10) : 10,
        scale: match ? parseInt(match[2], 10) : 0,
      },
      inputType: 'number',
    };
  },
  ENUM: (colType, colName, tableName) => {
    const enumValues = extractEnumValues(colType);
    if (enumValues && enumValues.length) {
      return {
        name: colName,
        type: {
          name: 'ENUM',
          enumBaseName: colName,
          enumDictName: snakeToCamel(`${tableName}_${colName}_enum_dict`),
          enumName: snakeToCamel(`${tableName}_${colName}_enum`),
        },
        enumValues,
        inputType: 'select',
      };
    }
    return {
      name: colName,
      type: {
        name: 'ENUM',
        enumBaseName: colName,
        enumDictName: snakeToCamel(`${tableName}_${colName}_enum_dict`),
        enumName: snakeToCamel(`${tableName}_${colName}_enum`),
      },
      enumValues: [],
      inputType: 'select',
    };
  },
  BOOLEAN: (colType, colName) => ({
    name: colName,
    type: { name: 'BOOLEAN' },
    inputType: 'checkbox',
  }),
  TEXT: (colType, colName) => ({
    name: colName,
    type: { name: 'TEXT' },
    inputType: 'text',
  }),
};
