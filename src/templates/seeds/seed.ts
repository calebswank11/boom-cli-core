import { Orm, ORMEnum, SeedBase, SqlDataType } from '../../@types';
import { DataRegistry } from '../../registries/DataRegistry';

const dataRegistry = DataRegistry.getInstance();

const fakerMappings: Record<string, () => any> = {
  username: () => `faker.internet.username()`,
  email: () => `faker.internet.email()`,
  phone: () => `faker.phone.number({style: 'national'})`,
  name: () => `faker.person.fullName()`,
  education_level: () =>
    `faker.helpers.arrayElement(["High School", "Bachelor's", "Master's", "PhD"])`,
  expertise_area: () =>
    `faker.helpers.arrayElement(["Software Engineering", "Marketing", "Finance", "Healthcare"])`,
  code: () => `faker.string.alphanumeric(8).toUpperCase()`,
  address: () => `faker.location.streetAddress()`,
  company_name: () => `faker.company.name()`,
  industry: () =>
    `faker.helpers.arrayElement(["Technology", "Finance", "Healthcare", "Education"])`,
  description: () => `faker.lorem.sentence()`,
  path_name: () => `faker.lorem.words(3)`,
  item_name: () => `faker.commerce.productName()`,
  title: () => `faker.person.jobTitle()`,
  city: () => `faker.location.city()`,
  state: () => `faker.location.state()`,
  zip: () => `faker.location.zipCode()`,
  country: () => `faker.location.country()`,
  required_major: () =>
    `faker.helpers.arrayElement(["Computer Science", "Business", "Physics", "Biology"])`,
  step_name: () =>
    '`Step ${faker.number.int({ min: 1, max: 10 })}: ${faker.lorem.words(2)}`',
  job_title: () => `faker.person.jobTitle()`,
  education_level_required: () =>
    `faker.helpers.arrayElement(["None", "High School", "Bachelor's", "Master's"])`,
  matrix_user_id: () => `faker.string.alphanumeric(10)`,
  type: () => `faker.helpers.arrayElement(["Admin", "User", "Moderator"])`,
  interaction_type: () =>
    `faker.helpers.arrayElement(["Click", "Page View", "Form Submit"])`,
  activity_type: () =>
    `faker.helpers.arrayElement(["Login", "Purchase", "Logout", "Profile Update"])`,
};

const getFakerValue = (field: string) => {
  return fakerMappings[field] ? fakerMappings[field]() : 'faker.lorem.word()';
};

const SENSITIVE_KEYWORDS = [
  'pass',
  'password',
  'auth',
  'key',
  'secret',
  'token',
  'credentials',
  'oauth',
  'jwt',
  'session',
];

function lazyMatchPass(field: string): boolean {
  return SENSITIVE_KEYWORDS.some((keyword) =>
    field.toLowerCase().includes(keyword.toLowerCase()),
  );
}

const getFieldValue = (tableName: string, columnName: string) => {
  const tableColumn = dataRegistry.getTableColumn(tableName, columnName);

  const columnType = tableColumn?.type.name;

  if (lazyMatchPass(tableColumn?.name || '')) {
    // creates it in the seed so it guarantees unique
    return `bcrypt.hashSync('123qwe', 10)`;
  }

  if (tableColumn?.type.name === SqlDataType.ENUM) {
    // lookup enum and handle
    return `getRandomIdx(['${(tableColumn.enumValues || []).join("','")}'])`;
  }
  if (columnType === SqlDataType.UUID) {
    // these are lookups, use the data that is being fetched.
    if (tableColumn?.reference) {
      return `getRandomIdx(${tableColumn.reference.tableName}Data)`;
    }
  }
  switch (columnType) {
    case SqlDataType.TEXT:
    case SqlDataType.VARCHAR:
      return getFakerValue(tableColumn?.name || '');
    case SqlDataType.INT:
      return `faker.number.int({ min: 1, max: 1000 })`; // Generates a random integer
    case SqlDataType.BOOLEAN:
      return 'faker.datatype.boolean()'; // Generates true/false
    case SqlDataType.DATE:
      return "faker.date.recent().toISOString().split('T')[0]";
    case SqlDataType.TIMESTAMP:
      return 'faker.date.recent().toISOString()'; // Generates a recent timestamp
    case SqlDataType.NUMERIC:
    case SqlDataType.DECIMAL:
    case SqlDataType.FLOAT: {
      const precision = tableColumn?.type?.precision ?? 10;
      const scale = tableColumn?.type?.scale ?? 0;

      const integerDigits = precision - scale;
      const max = parseFloat(`${'9'.repeat(integerDigits)}.${'9'.repeat(scale)}`);
      const min = 0;

      return `faker.number.float({ min: ${min}, max: ${max}, fractionDigits: ${scale} })`;
    }
    case SqlDataType.TIME:
      return "faker.date.recent().toISOString().split('T')[1].split('.')[0]"; // Extracts only the time part
    case SqlDataType.JSONB:
      return '{}';
    default:
      return null;
  }
};

export const getSeedTemplate = (orm: Orm) => {
  switch (orm) {
    case ORMEnum.knex:
      return knexSeedTemplate;
    case ORMEnum.sequelize:
      return sequelizeSeedTemplate;
    case ORMEnum.typeorm:
      return typeOrmSeedTemplate;
    case ORMEnum.prisma:
      return prismaSeedTemplate;
  }
};
const knexSeedTemplate = (seeds: SeedBase[]) => {
  const fetchedData: string[] = [];

  const builtSeeds = seeds.map((seed) => {
    return `
      ${seed.references
        .map((reference) => {
          if (fetchedData.includes(reference.refTable)) {
            return;
          }
          fetchedData.push(reference.refTable);
          return `
        const ${reference.refTable}Data: (string | number)[] = await knex('${reference.refTable}').pluck('${reference.key}').limit(50);
      `;
        })
        .join('\n')}      
        await seedTable('${seed.tableName}', Array.from({length: 25}, () => ({
          ${seed.fields.map((field) => `${field.column}: ${getFieldValue(seed.tableName, field.column)}`).join(',\n')}
        })));
    `;
  });

  return `
import type { Knex } from 'knex';
import { faker } from '@faker-js/faker';
import {
  shouldSeedData,
  getRandomIdx,
} from '../utils';
import bcrypt from 'bcryptjs';

exports.seed = async function (knex: Knex) {
  
  async function seedTable(table: string, rows: any[]) {
    if (await shouldSeedData(knex, table)) {
      await knex(table).insert(rows);
    }
  }

  ${builtSeeds.join('\n')}
}
`;
};

const sequelizeSeedTemplate = (seeds: SeedBase[]) => {
  const fetchedData: string[] = [];

  const builtSeeds = seeds.map((seed) => {
    return `
      ${seed.references
        .map((reference) => {
          if (fetchedData.includes(reference.refTable)) {
            return;
          }
          fetchedData.push(reference.refTable);
          return `
        const ${reference.refTable}Data: (string | number)[] = await queryInterface.sequelize.query('SELECT id FROM ${reference.refTable} LIMIT 50');
      `;
        })
        .join('\n')}      
        await seedTable(queryInterface, '${seed.tableName}', Array.from({length: 25}, () => ({
          ${seed.fields.map((field) => `${field.column}: ${getFieldValue(seed.tableName, field.column)}`).join(',\n')}
        })));
    `;
  });

  return `
import { QueryInterface} from 'sequelize';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import {
  seedTable,
  getRandomIdx,
} from '../utils';

export default {
  up: async (queryInterface: QueryInterface) => {
    ${builtSeeds.join('\n')}
  },
  down: async (queryInterface: QueryInterface) => {
    
  }
}  
  `;
};

const typeOrmSeedTemplate = (seeds: SeedBase[]) => {
  return `typeOrmSeedTemplate`;
};
const prismaSeedTemplate = (seeds: SeedBase[]) => {
  return `prismaSeedTemplate`;
};
