import { TableStructureBase, TypedefsBase } from '../@types';
import { typedefsTypeParsers } from '../helpers';
import { snakeToCamel } from '../utils/stringUtils';

export const buildTypedefs = (tables: TableStructureBase[]): TypedefsBase[] => {
  const typedefs: TypedefsBase[] = [];
  // process individual file
  tables.map((tableStructure) => {
    // process individual table
    const graphQLFields: TypedefsBase = {
      name: tableStructure.name,
      description: `Generated objectTypes for ${tableStructure.name}`,
      fields: [],
    };

    Object.values(tableStructure.columns).map((tableColumn) => {
      // process columns
      graphQLFields.fields.push(
        typedefsTypeParsers[tableColumn.type.name](
          tableColumn.name,
          tableColumn.nullable,
          snakeToCamel(`${tableStructure.name}_${tableColumn.name}_enum`),
          tableColumn.enumValues,
        ),
      );
    });
    typedefs.push(graphQLFields);
  });
  return typedefs;
};
