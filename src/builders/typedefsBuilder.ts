import { GraphQLField, RelationshipType, TableStructureBase, TypedefsBase } from '../@types';
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

    // Add regular columns
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

    // Add relationship fields
    if (tableStructure.relationships) {
      tableStructure.relationships.forEach((relationship) => {
        const fieldName = snakeToCamel(relationship.sourceColumn);
        const targetType = snakeToCamel(relationship.targetTable);

        switch (relationship.type) {
          case RelationshipType.ONE_TO_ONE:
            graphQLFields.fields.push({
              key: fieldName,
              type: GraphQLField.GraphQLObjectType,
              nullable: true,
              list: false,
              targetType,
            });
            break;
          case RelationshipType.ONE_TO_MANY:
            graphQLFields.fields.push({
              key: fieldName,
              type: GraphQLField.GraphQLObjectType,
              nullable: true,
              list: true,
              targetType,
            });
            break;
          case RelationshipType.MANY_TO_MANY:
            graphQLFields.fields.push({
              key: fieldName,
              type: GraphQLField.GraphQLObjectType,
              nullable: true,
              list: true,
              targetType,
            });
            break;
          case RelationshipType.MANY_TO_ONE:
            graphQLFields.fields.push({
              key: fieldName,
              type: GraphQLField.GraphQLObjectType,
              nullable: true,
              list: false,
              targetType,
            });
            break;
        }
      });
    }

    typedefs.push(graphQLFields);
  });
  return typedefs;
};
