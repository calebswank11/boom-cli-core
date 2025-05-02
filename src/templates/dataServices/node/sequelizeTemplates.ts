import { APIData } from '../../../@types';
import { camelToPascal, snakeToPascalCase } from '../../../utils/stringUtils';

export const findManySequelizeTemplate = (
  api: APIData,
  functionName: string,
): string => {
  return `
    export const ${functionName} = async (args: ${camelToPascal(functionName + 'Args')}[]): Promise<${api.responseType}[] | undefined> => {
      try {
        return (await ${snakeToPascalCase(api.tableName)}Model.findAll({where: {[Op.or]: args}})) as unknown as ${api.responseType}[];
      } catch (error) {
        console.error(error);
        return undefined;
      }
    }
  `;
};

export const findByIdSequelizeTemplate = (
  api: APIData,
  functionName: string,
): string => {
  return `
    export const ${functionName} = async (id: string): Promise<Omit<${api.responseType}, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> | undefined> => {
      try {
        const result = await ${snakeToPascalCase(api.tableName)}Model.findOne({where: {id}});
        return result ? (result as unknown as ${api.responseType}) : undefined;
      } catch (error) {
        console.error(error);
        return undefined;
      }
    }
  `;
};
export const createManySequelizeTemplate = (
  api: APIData,
  functionName: string,
): string => {
  return `
    export const ${functionName} = async (args: ${camelToPascal(functionName + 'Args')}[]): Promise<${api.responseType}[] | undefined> => {
      if(!args?.length) {
        console.error('Args were empty for ${functionName}')
        return undefined;
      }

      return runTransaction<${api.responseType}[]>(async (transaction) => {
        const records = await ${snakeToPascalCase(api.tableName)}Model.bulkCreate(args, {transaction, returning: true});

        if(!records.length) {
          throw new Error('There was an error creating records for ${functionName}')
        }

        return records as unknown as ${api.responseType}[];
      });
    }
  `;
};
export const createSequelizeTemplate = (
  api: APIData,
  functionName: string,
): string => {
  return `
    export const ${functionName} = async (args: ${camelToPascal(functionName + 'Args')}): Promise<${api.responseType} | undefined> => {

      return runTransaction<${api.responseType}>(async (transaction) => {
        const record = await ${snakeToPascalCase(api.tableName)}Model.create(args, {transaction, returning: true});

        if(!record) {
          throw new Error('There was an error creating a record for ${functionName}')
        }

        return record as unknown as ${api.responseType};
      });
    }
  `;
};
export const updateManySequelizeTemplate = (
  api: APIData,
  functionName: string,
): string => {
  return `
    export const ${functionName} = async (args: ${camelToPascal(functionName + 'Args')}[]): Promise<${api.responseType}[] | undefined> => {
      if(!args?.length) {
        console.error('Args were empty for ${functionName}')
        return undefined;
      }

      return runTransaction<${api.responseType}[]>(async (transaction) => {
        const records = await ${snakeToPascalCase(api.tableName)}Model.bulkCreate(args, {transaction, returning: true, updateOnDuplicate: [${Object.values(
          api.args,
        )
          .map((arg) => `'${arg.name}'`)
          .join(',')}]});

        if (!records.length) {
          throw new Error('There was an error updating records for ${functionName}')
        }

        return records as unknown as ${api.responseType}[];
      })
    }
  `;
};
export const updateSequelizeTemplate = (
  api: APIData,
  functionName: string,
): string => {
  return `
    export const ${functionName} = async (args: ${camelToPascal(functionName + 'Args')}): Promise<${api.responseType} | undefined> => {

      return runTransaction<${api.responseType}>(async (transaction) => {
        const [updCount, result] = await ${snakeToPascalCase(api.tableName)}Model.update(args, {
            transaction,
            where: { id: args.id },
            returning: true,
        });

        if(updCount === 0) {
          throw new Error('No records updated for ${functionName}');
        }

        return result?.[0] as unknown as ${api.responseType};

      })
    }`;
};
export const countSequelizeTemplate = (
  api: APIData,
  functionName: string,
): string => {
  return `
    export const ${functionName} = async ():Promise<number> => {
      try {
        return ${snakeToPascalCase(api.tableName)}Model.count();
      } catch (error) {
        console.error(error);
        return 0;
      }
    }
  `;
};
export const deleteSequelizeTemplate = (
  api: APIData,
  functionName: string,
): string => {
  return `
    export const ${functionName} = async (id: string):Promise<{success: boolean}> => {
      return runTransaction<{success: boolean}>(async (transaction) => {
        const deleted = await ${snakeToPascalCase(api.tableName)}Model.destroy({
          where: {
            id,
          }, transaction}
        );

        if(!deleted) {
          throw new Error('No record deleted for the provided id');
        }
        return {success: false}
      })

    }
  `;
};
export const deleteManySequelizeTemplate = (
  api: APIData,
  functionName: string,
): string => {
  return `
    export const ${functionName} = async (ids: string[]):Promise<{success: boolean}> => {

      return runTransaction<{success: boolean}>(async (transaction) => {
        const deleted = await ${snakeToPascalCase(api.tableName)}Model.destroy({
          where: {
            id: {
              [Op.in]: ids
            }
          }, transaction}
        );

        if (deleted !== ids.length) {
          throw new Error('Not all records were deleted');
        }

        return { success: true };

      });
    }
  `;
};
