import { TableStructureBase, TableStructureByFile } from '../@types';
import { defaultTableData } from '../data/defaultTableData';

// needs to be config driven probably...
const defaultColumns = ['id', 'created_at', 'updated_at', 'deleted_at'];

export class ExtractTables {
  static extract(
    tableStructureByFile: TableStructureByFile,
  ): Record<string, TableStructureBase> {
    const tableStructure: Record<string, TableStructureBase> = {};
    Object.keys(tableStructureByFile).map((key) => {
      return tableStructureByFile[key].map((table) => {
        // NOTE
        //  enforce default columns for column integrity.
        const columnsKeys = Object.keys(table.columns);
        const missingColumns = defaultColumns.filter(
          (col) => !columnsKeys.includes(col),
        );
        if (missingColumns.length > 0) {
          missingColumns.map((column) => {
            table.columns[column] = defaultTableData.defaultColumns[column];
          });
        }
        tableStructure[table.name] = table;
      });
    });
    return tableStructure;
  }
}
