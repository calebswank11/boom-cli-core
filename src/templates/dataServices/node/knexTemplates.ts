import { APIData } from '../../../@types';
import { camelToPascal } from '../../../utils/stringUtils';

export const findManyKnexTemplate = (api: APIData, functionName: string): string => {
  const args = Object.values(api.args);
  const whereStatement = args
    .map((arg, index) => {
      if (['created_at', 'updated_at', 'deleted_at'].includes(arg.name)) {
        return `this.orWhereIn('${arg.name}', args.map((arg) => arg.${arg.name}?.toString())
        .filter(Boolean) as string[])`;
      }
      if (index === 0) {
        return `this.whereIn('${arg.name}', args.map(arg => arg.${arg.name}))`;
      } else {
        return `this.orWhereIn('${arg.name}', args.map(arg => arg.${arg.name}))`;
      }
    })
    .join('\n');

  return `
    export const ${functionName} = async (args: ${camelToPascal(functionName + 'Args')}[]): Promise<${api.responseType}[] | undefined> =>
      customWhere(
        knex('${api.tableName}').where(function(){
          if (!args.length) return [];
          const fields = Object.keys(args[0]) as (keyof ${api.responseType})[];
          const self = this;

          let addedAny = false;

          fields.forEach((field) => {
            const values = args.map((arg) => arg[field]).filter(Boolean);

            if (values.length > 0) {
              addedAny = true;
              const isDate = ['created_at', 'updated_at', 'deleted_at'].includes(field);
              const transformed = isDate
                ? values.map((v) => v && new Date(v as string).toString()).filter(Boolean)
                : values;

              self.orWhereIn(
                field as string,
                transformed as (string | number | boolean | Date)[]
              );
            }
          });

          if (!addedAny) {
            // Make sure this WHERE clause doesn't match anything if nothing valid was passed
            self.whereRaw('1=0');
          }
        })
      )`;
};

export const findByIdKnexTemplate = (api: APIData, functionName: string): string => {
  return `export const ${functionName} = async (id: string): Promise<${api.responseType} | undefined> => {
    const resp = await customWhere(knex('${api.tableName}').where('id', id).first());
    return resp ? resp[0] : undefined;
  }`;
};

export const createManyKnexTemplate = (
  api: APIData,
  functionName: string,
): string => {
  return `
    export const ${functionName} = async (args: ${camelToPascal(functionName + 'Args')}[]): Promise<${api.responseType}[] | undefined> => {

      if(args && args.length) {
        return runTransaction<${api.responseType}[]>(trx => trx('${api.tableName}').insert(args).returning('*'));
      }
    }`;
};

export const createKnexTemplate = (api: APIData, functionName: string): string => {
  return `
    export const ${functionName} = async (args: ${camelToPascal(functionName + 'Args')}): Promise<${api.responseType} | undefined> => {

      const resp = await runTransaction<${api.responseType}[]>((trx) => trx('${api.tableName}').insert(args).returning('*'));

      return resp && resp[0] ? resp[0] : undefined;

    }
  `;
};

export const updateManyKnexTemplate = (
  api: APIData,
  functionName: string,
): string => {
  const args = Object.values(api.args);
  const argToFilterBy = args.filter((arg) => arg.name.toLowerCase().includes('_id'));
  return `
    export const ${functionName} = async (args: ${camelToPascal(functionName + 'Args')}[]): Promise<${api.responseType}[] | undefined> => {
      const transaction = await knex.transaction();
      if(args && args.length) {

        const byId = ${argToFilterBy[0] ? `'${argToFilterBy[0].name}'` : 'null'};

        if(!byId) {
          throw new Error('No id to filter update by, will cascade incorrectly');
        }

        try {

          const updatedRecords: ${api.responseType}[] = [];


          for (const arg of args) {
            const [updated] = await transaction<${api.responseType}>('${api.tableName}')
            .where(byId, arg[byId])
            .update({
              ...arg,
              updated_at: new Date().toString(),
            })
            .returning('*');

            if (updated) updatedRecords.push(updated);
          }


          if(updatedRecords && updatedRecords.length > 0) {
            await transaction.commit();
            return updatedRecords;
          } else {
            console.error('Records were not updated, transaction was rolled back for dataservice: ${functionName}');
            await transaction.rollback();
            return [];
          }
        } catch(error){
          await transaction.rollback();
          console.error('Error processing multi-update for data service: ${functionName}', error);
        }

      }
    }
  `;
};

export const updateKnexTemplate = (api: APIData, functionName: string): string => {
  return `
    export const ${functionName} = async (args: ${camelToPascal(functionName + 'Args')}): Promise<${api.responseType} | undefined> => {
      const resp = await runTransaction<${api.responseType}[]>(trx => trx('${api.tableName}').update({
        ...args,
        updated_at: new Date().toString(),
      }).where('id', args.id).returning('*'));

      return resp && resp[0] ? resp[0] : undefined;
    }
  `;
};

export const countKnexTemplate = (api: APIData, functionName: string): string => {
  return `
    export const ${functionName} = async (): Promise<number> => {
      const result = await knex('${api.tableName}').count<{ count: string }[]>('* as count');
      return result[0]?.count ? Number(result[0].count) : 0;
     }
  `;
};

export const deleteKnexTemplate = (api: APIData, functionName: string): string => {
  return `
    export const ${functionName} = async (id: string): Promise<{success: boolean}> => {
      const newDate = new Date();
      const resp = await runTransaction<${api.responseType}[]>(trx => trx('${api.tableName}').update({
        updated_at: newDate.toString(),
        deleted_at: newDate.toString(),
      }).where('id', id).returning('*'));
      return {success: !!(resp && resp[0] && resp[0].deleted_at === newDate.toString())}
    }
  `;
};

export const deleteManyKnexTemplate = (
  api: APIData,
  functionName: string,
): string => {
  return `
    export const ${functionName} = async (ids: string[]): Promise<{success: boolean} | undefined> => {
    const newDate = new Date();
      return runTransaction<{success: boolean}>(trx => trx.update({
          updated_at: newDate,
          deleted_at: newDate,
        }).whereIn('id', ids)
        .returning('deleted_at'))
    }
  `;
};
