import { RelationshipType, TableRelationship, TableStructureBase } from '../@types';

export class RelationshipExtractor {
  private static instance: RelationshipExtractor;
  private relationshipMap: Map<string, TableRelationship[]> = new Map();

  private constructor() {}

  static getInstance(): RelationshipExtractor {
    if (!RelationshipExtractor.instance) {
      RelationshipExtractor.instance = new RelationshipExtractor();
    }
    return RelationshipExtractor.instance;
  }

  /**
   * Analyzes and extracts relationships between tables
   */
  extractRelationships(tables: Record<string, TableStructureBase>): Map<string, TableRelationship[]> {
    this.relationshipMap.clear();

    // First pass: Identify all potential relationships from foreign keys
    Object.values(tables).forEach(table => {
      const relationships: TableRelationship[] = [];

      Object.values(table.columns).forEach(column => {
        if (column.reference) {
          const relationship = this.createRelationshipFromReference(table, column);
          if (relationship) {
            relationships.push(relationship);
          }
        }
      });

      if (relationships.length > 0) {
        this.relationshipMap.set(table.name, relationships);
      }
    });

    // Second pass: Identify many-to-many relationships
    this.identifyManyToManyRelationships(tables);

    // Third pass: Validate and enrich relationships
    this.validateAndEnrichRelationships(tables);

    return this.relationshipMap;
  }

  /**
   * Creates a relationship object from a column reference
   */
  private createRelationshipFromReference(
    table: TableStructureBase,
    column: { name: string; reference?: { tableName: string; colName: string } }
  ): TableRelationship | null {
    if (!column.reference) return null;

    const isPrimaryKey = column.name === 'id';
    const targetTable = column.reference.tableName;
    const targetColumn = column.reference.colName;

    let relationshipType: RelationshipType;
    if (isPrimaryKey) {
      relationshipType = RelationshipType.ONE_TO_MANY;
    } else {
      relationshipType = RelationshipType.MANY_TO_ONE;
    }

    return {
      type: relationshipType,
      sourceTable: table.name,
      targetTable,
      sourceColumn: column.name,
      targetColumn,
      navigationPropertySource: this.generateNavigationPropertyName(table.name, targetTable),
      navigationPropertyTarget: this.generateNavigationPropertyName(targetTable, table.name)
    };
  }

  /**
   * Identifies many-to-many relationships by looking for junction tables
   */
  private identifyManyToManyRelationships(tables: Record<string, TableStructureBase>) {
    Object.values(tables).forEach(table => {
      // Check if this is a junction table (has two foreign keys and possibly a primary key)
      const foreignKeys = Object.values(table.columns).filter(col => col.reference);

      if (foreignKeys.length === 2) {
        const [fk1, fk2] = foreignKeys;
        const table1 = fk1.reference!.tableName;
        const table2 = fk2.reference!.tableName;

        // Create bidirectional many-to-many relationships
        this.addManyToManyRelationship(table1, table2, table.name);
        this.addManyToManyRelationship(table2, table1, table.name);
      }
    });
  }

  /**
   * Adds a many-to-many relationship between two tables
   */
  private addManyToManyRelationship(sourceTable: string, targetTable: string, junctionTable: string) {
    const relationship: TableRelationship = {
      type: RelationshipType.MANY_TO_MANY,
      sourceTable,
      targetTable,
      sourceColumn: 'id', // This will be replaced with actual column names
      targetColumn: 'id', // This will be replaced with actual column names
      junctionTable,
      navigationPropertySource: this.generateNavigationPropertyName(sourceTable, targetTable, true),
      navigationPropertyTarget: this.generateNavigationPropertyName(targetTable, sourceTable, true)
    };

    const existingRelationships = this.relationshipMap.get(sourceTable) || [];
    this.relationshipMap.set(sourceTable, [...existingRelationships, relationship]);
  }

  /**
   * Validates and enriches relationships with additional metadata
   */
  private validateAndEnrichRelationships(tables: Record<string, TableStructureBase>) {
    this.relationshipMap.forEach((relationships, tableName) => {
      relationships.forEach(relationship => {
        // Validate that referenced tables exist
        if (!tables[relationship.targetTable]) {
          console.warn(`Warning: Relationship in ${tableName} references non-existent table ${relationship.targetTable}`);
          return;
        }

        // Add cascade delete/update information if available
        const sourceColumn = tables[tableName].columns[relationship.sourceColumn];
        if (sourceColumn.reference) {
          relationship.onDelete = sourceColumn.reference.onDelete;
          relationship.onUpdate = sourceColumn.reference.onUpdate;
        }

        // Add index information
        const targetColumn = tables[relationship.targetTable].columns[relationship.targetColumn];
        if (targetColumn.indexes) {
          relationship.targetIndex = targetColumn.indexes;
        }
      });
    });
  }

  /**
   * Generates a navigation property name for a relationship
   */
  private generateNavigationPropertyName(
    sourceTable: string,
    targetTable: string,
    isManyToMany: boolean = false
  ): string {
    const prefix = isManyToMany ? 'many' : 'one';
    return `${prefix}${this.toPascalCase(targetTable)}`;
  }

  /**
   * Converts a string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
}
