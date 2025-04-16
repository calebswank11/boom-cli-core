// export const graphQLDataServicesTemplate = (dataServices: DataServicesBase[]) => {
//   const createdDataServices: string[] = [];
//   const typesToImport: string[] = [];
//
//   const fileDataServices = dataServices
//     .map(({ type, returnType, name, args, tableName }) => {
//       let dataService = '';
//       const formattedReturnType = snakeToPascalCase(tableName);
//
//       if (!createdDataServices.includes(name)) {
//         switch (type) {
//           case 'findMany':
//           case 'multiple':
//             typesToImport.push(formattedReturnType);
//             dataService = `export const ${name} = async ({
//               ${args.map(([arg]) => `${arg}`).join(',\n')}
//             }: {
//               ${args.map(([arg, type]) => `${arg}: ${type}`).join(',\n')}
//             }): Promise<${formattedReturnType}[] | undefined> =>
//             customWhere(
//               knex('${tableName}').where({
//                 ${args.map(([arg]) => `${arg}`).join(',\n')}
//               }),
//             )`;
//             break;
//           case 'count':
//             dataService = `
//               export const ${name} = async (): Promise<number> => {
//                 const result = await knex('${tableName}').count('* as count');
//                 return result.count ? parseInt(result.count, 10) : 0;
//               }
//             `;
//             break;
//           case 'single':
//           default:
//             typesToImport.push(formattedReturnType);
//             dataService = `export const ${name} = async ({
//               ${args.map(([arg]) => `${arg}`).join(',\n')}
//             }: {
//               ${args.map(([arg, type]) => `${arg}: ${type}`).join(',\n')}
//             }): Promise<${formattedReturnType} | undefined> =>
//             customWhere(
//               knex('${tableName}').where({
//                 ${args.map(([arg]) => `${arg}`).join(',\n')}
//               }),
//             ).first()`;
//         }
//         createdDataServices.push(name);
//         return dataService;
//       }
//     })
//     .filter((ds) => ds)
//     .join('\n\n');
//
//   return `
//     import type {Knex} from 'knex';
//     import {getKnex} from '../../database/knexInstance';
//     import {customWhere} from '../utils';
//     import {
//       ${[...new Set(typesToImport)].join(',\n')}
//     } from '../../@types';
//
//     const knex: Knex = getKnex();
//
//     ${fileDataServices}
//
//   `;
// };
