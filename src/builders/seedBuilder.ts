import { SeedBase, SeedsRegistryBase, TableStructureByFile } from '../@types';

export function buildSeedsData(
  tableStructureByFile: TableStructureByFile,
): SeedsRegistryBase[] {
  const seedRegistryData: SeedsRegistryBase[] = [];
  const fileNames = Object.keys(tableStructureByFile);
  fileNames.forEach((fileName) => {
    const seedData: SeedBase[] = [];
    // process individual file
    tableStructureByFile[fileName].map((tableStructure) => {
      // process individual table
      const dataToSeed: SeedBase = {
        tableName: tableStructure.name,
        references: [],
        fields: [],
        requiredFields: [],
        enums: [],
        constraints: [],
      };
      Object.values(tableStructure.columns)
        .filter(
          (tableColumn) =>
            !['created_at', 'id', 'deleted_at', 'updated_at'].includes(
              tableColumn.name,
            ),
        )
        .map((tableColumn) => {
          // process columns
          dataToSeed.fields.push({
            column: tableColumn.name,
            type: tableColumn.type.name,
          });
          if (tableColumn.unique) {
            dataToSeed.constraints.push({
              column: tableColumn.name,
              type: 'unique',
            });
          }
          if (!tableColumn.nullable) {
            dataToSeed.requiredFields.push(tableColumn.name);
          }
          if (tableColumn.reference) {
            dataToSeed.references.push({
              refTable: tableColumn.reference.tableName,
              key: tableColumn.reference.colName,
              type: tableColumn.type.name,
              column: tableColumn.name,
            });
          }
          if (tableColumn.enumValues) {
            dataToSeed.enums.push({
              column: tableColumn.name,
              values: tableColumn.enumValues,
            });
          }
        });
      seedData.push(dataToSeed);
    });
    seedRegistryData.push({ name: fileName, seeds: seedData });
  });
  return seedRegistryData;
}
