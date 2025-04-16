import { DataServicesBase, TableStructureByFile, TypedefsBase } from '../@types';
import { typedefsTypeParsers } from '../helpers';
import { snakeToCamel } from '../utils/stringUtils';

export const buildDataServices = (
  tableStructureByFile: TableStructureByFile,
): DataServicesBase[] => {
  const typedefs: DataServicesBase[] = [];
  const fileNames = Object.keys(tableStructureByFile);
  fileNames.forEach((fileName) => {
    // process individual file
    tableStructureByFile[fileName].map((tableStructure) => {
      // process individual table
      // const graphQLFields: DataServicesBase = {
      //   name: tableStructure.name,
      //   description: `Generated objectTypes for ${tableStructure.name}`,
      //   fields: [],
      // };

      Object.values(tableStructure.columns).map((tableColumn) => {
        // process columns
        // graphQLFields.fields.push(
        //   typedefsTypeParsers[tableColumn.type.name](
        //     tableColumn.name,
        //     tableColumn.nullable,
        //     snakeToCamel(`${tableStructure.name}_${tableColumn.name}_enum`),
        //     tableColumn.enumValues,
        //   ),
        // );
      });
      // typedefs.push(graphQLFields);
    });
  });
  return typedefs;
};
