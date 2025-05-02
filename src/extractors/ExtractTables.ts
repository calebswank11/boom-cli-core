import { TableStructureBase, TableStructureByFile } from '../@types';
import { defaultTableData } from '../data/defaultTableData';
import { RelationshipExtractor } from './RelationshipExtractor';

// needs to be config driven probably...
const defaultColumns = ['id', 'created_at', 'updated_at', 'deleted_at'];

export class ExtractTables {
  static extract(
    tableStructureByFile: TableStructureByFile,
  ): Record<string, TableStructureBase> {
    const tableStructure: Record<string, TableStructureBase> = {};

    // First pass: Extract basic table structure
    Object.keys(tableStructureByFile).map((key) => {
      return tableStructureByFile[key].map((table) => {
        // Enforce default columns for column integrity
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

    // Second pass: Extract and enrich relationships
    const relationshipExtractor = RelationshipExtractor.getInstance();
    const relationships = relationshipExtractor.extractRelationships(tableStructure);

    // Third pass: Apply relationships to tables
    relationships.forEach((tableRelationships, tableName) => {
      if (tableStructure[tableName]) {
        tableStructure[tableName].relationships = tableRelationships;
      }
    });

    return tableStructure;
  }
}
