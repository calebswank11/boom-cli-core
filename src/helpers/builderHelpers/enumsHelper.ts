import { SqlDataType, TableStructureBase } from '../../@types';
import { EnumsBase } from '../../registries';
import { sanitizeEnumKey, snakeToCamel } from '../../utils/stringUtils';

export const buildEnums = (tables: TableStructureBase[]): EnumsBase[] => {
  const enums: EnumsBase[] = [];
  // process individual file
  tables.map((table) => {
    // process individual table

    Object.values(table.columns).map((tableColumn) => {
      // process columns
      if (tableColumn.type.name === SqlDataType.ENUM) {
        enums.push(
          `export const ${tableColumn.type.enumDictName} = {\n${(tableColumn.enumValues || []).map((ev) => `${sanitizeEnumKey(ev)}: '${ev}'`).join(',\n')}\n} as const;`,
        );

        const snakeCaseEnum = snakeToCamel(
          `${table.name}_${tableColumn.type.enumBaseName}_enum`,
        );

        enums.push(
          `export const ${snakeCaseEnum} = Object.values(${tableColumn.type.enumDictName});\n`,
        );
      }
    });
  });
  return enums;
};
