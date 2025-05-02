import { readdir, readFile } from 'fs/promises';
import path from 'path';
import {
  snakeToCamel,
  snakeToCapSentence,
  snakeToPascalCase,
} from '../../utils/stringUtils';
import {
  TableColumnStructureBase,
  TableConstraint,
  TableStructureByFile,
} from '../../@types';
import {
  generateValidationRules,
  inferDescriptionFromSql,
  inferExampleFromSql,
  sqlTypeParsers,
} from '../../helpers';

export class ProcessSqlController {
  private filesToProcess: string[] = [];
  private directoryPath: string | undefined = undefined;
  private tableStructure: TableStructureByFile = {};

  async getFiles(path: string) {
    this.directoryPath = path;
    const files = await readdir(path);
    this.filesToProcess = files;
    return files;
  }

  getStructure() {
    return this.tableStructure;
  }

  private addConstraintToStructureAtIndex(
    fileName: string,
    index: number,
    constraint: TableConstraint,
  ) {
    if (this.tableStructure[fileName][index]) {
      if (Array.isArray(this.tableStructure[fileName][index].constraints)) {
        this.tableStructure[fileName][index].constraints.push(constraint);
      } else {
        this.tableStructure[fileName][index].constraints = [constraint];
      }
    }
  }

  private addTableToStructure(tableName: string, fileName: string) {
    const pascalTableName = snakeToPascalCase(tableName);
    const camelTableName = snakeToCamel(tableName);
    const capSentenceTableName = snakeToCapSentence(tableName);
    if (this.tableStructure[fileName]) {
      this.tableStructure[fileName].push({
        fileOriginatorName: fileName,
        name: tableName,
        pascalCase: pascalTableName,
        camelCase: camelTableName,
        capSentenceCase: capSentenceTableName,
        columns: {},
      });
    } else {
      this.tableStructure[fileName] = [
        {
          fileOriginatorName: fileName,
          name: tableName,
          pascalCase: pascalTableName,
          camelCase: camelTableName,
          capSentenceCase: capSentenceTableName,
          columns: {},
        },
      ];
    }
  }

  // adds by last index.
  private addColumnToStructure(
    tableName: string,
    colAttrs: TableColumnStructureBase,
    fileName: string,
  ) {
    if (this.tableStructure[fileName]) {
      this.tableStructure[fileName][
        this.tableStructure[fileName].length - 1
      ].columns[colAttrs.name] = colAttrs;
    } else {
      this.addTableToStructure(tableName, fileName);
      this.tableStructure[fileName][
        // @ts-ignore columns exists because the prev line adds it.
        this.tableStructure[fileName].length - 1
        // @ts-ignore columns exists because the prev line adds it.
      ].columns[colAttrs.name] = colAttrs;
    }
  }

  private checkEnumValidity(enums: string[]): boolean | undefined {
    const invalidValues = enums.filter((val) => !/^[a-zA-Z0-9_]+$/.test(val));
    if (invalidValues.length > 0) {
      throw new Error(
        `Invalid ENUM values: ${invalidValues.join(
          ', ',
        )}. Enums must not contain spaces, hyphens, or special characters.`,
      );
    }
    return true;
  }

  private normalizeMultilineConstraints(lines: string[]): string[] {
    const normalized: string[] = [];
    let buffer: string[] = [];
    let parenDepth = 0;
    let capturingBlock = false;
    let captureType: 'constraint' | 'case' | 'generated' | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Detect GENERATED ALWAYS AS blocks which might contain CASE statements
      if (!capturingBlock && /GENERATED\s+ALWAYS\s+AS\s*\(/i.test(trimmed)) {
        capturingBlock = true;
        captureType = 'generated';
        buffer.push(trimmed);

        // Count open parentheses after "AS"
        const asPos = trimmed.toUpperCase().indexOf('AS');
        const afterAs = trimmed.substring(asPos + 2);
        parenDepth =
          (afterAs.match(/\(/g) || []).length - (afterAs.match(/\)/g) || []).length;

        // If the block is already complete in this line
        if (parenDepth === 0 && trimmed.endsWith(',')) {
          normalized.push(buffer.join(' '));
          buffer = [];
          capturingBlock = false;
          captureType = null;
        }
      }
      // Start of a CONSTRAINT CHECK block
      else if (!capturingBlock && /^constraint\b.*check\b/i.test(trimmed)) {
        capturingBlock = true;
        captureType = 'constraint';
        buffer.push(trimmed);

        parenDepth =
          (trimmed.match(/\(/g) || []).length - (trimmed.match(/\)/g) || []).length;

        if (parenDepth === 0 && !trimmed.endsWith(',')) {
          normalized.push(buffer.join(' '));
          buffer = [];
          capturingBlock = false;
          captureType = null;
        }
      }
      // Start of a standalone CASE statement (not part of GENERATED)
      else if (!capturingBlock && /\bCASE\b/i.test(trimmed)) {
        capturingBlock = true;
        captureType = 'case';
        buffer.push(trimmed);

        parenDepth =
          (trimmed.match(/\(/g) || []).length - (trimmed.match(/\)/g) || []).length;

        if (/\bEND\b/i.test(trimmed) && parenDepth === 0) {
          normalized.push(buffer.join(' '));
          buffer = [];
          capturingBlock = false;
          captureType = null;
        }
      }
      // Continue capturing an existing block
      else if (capturingBlock) {
        buffer.push(trimmed);

        // Update paren depth
        parenDepth += (trimmed.match(/\(/g) || []).length;
        parenDepth -= (trimmed.match(/\)/g) || []).length;

        // Check for block completion
        let blockComplete = false;

        if (captureType === 'generated' || captureType === 'constraint') {
          blockComplete = parenDepth === 0;
        } else if (captureType === 'case') {
          blockComplete = /\bEND\b/i.test(trimmed) && parenDepth === 0;
        }

        if (blockComplete) {
          // Find where this statement ends (usually with a comma)
          const commaPos = trimmed.lastIndexOf(',');

          if (commaPos !== -1) {
            // Add everything up to and including the comma
            buffer[buffer.length - 1] = trimmed.substring(0, commaPos + 1);
            normalized.push(buffer.join(' '));

            // Process anything after the comma separately
            const afterComma = trimmed.substring(commaPos + 1).trim();
            if (afterComma) {
              normalized.push(afterComma);
            }
          } else {
            // No comma found, just add the whole block
            normalized.push(buffer.join(' '));
          }

          buffer = [];
          capturingBlock = false;
          captureType = null;
        }
      } else {
        normalized.push(trimmed);
      }
    }

    // Handle any remaining content in buffer
    if (buffer.length > 0) {
      normalized.push(buffer.join(' '));
    }

    return normalized;
  }

  private extractIndexMethod(indexSql: string): string | null {
    const match = indexSql.match(/using\s+(\w+)/i);
    return match ? match[1].toLowerCase() : null;
  }

  private extractConstraint(line: string) {
    const nameMatch = line.match(/CONSTRAINT\s+(\w+)/i);
    const typeMatch = line.match(/\b(CHECK|UNIQUE|FOREIGN KEY|PRIMARY KEY)\b/i);

    // This captures the full CHECK expression including parens
    const checkExprMatch = line.match(/\bCHECK\s*\(([\s\S]*)\)$/i);

    if (nameMatch && typeMatch) {
      return {
        name: nameMatch[1],
        type: typeMatch[1].toUpperCase(),
        expression: checkExprMatch ? `${checkExprMatch[1].trim()}` : undefined,
      };
    }

    console.warn('Could not parse constraint line:', line);
    return;
  }

  private extractTables(
    tables: string[],
    fileName: string,
    indexDictionary: Record<string, Record<string, string>>,
    typesDictionary: Record<string, string[]>,
    alterConstraints: string[],
  ) {
    tables.forEach((tableDef, index) => {
      const lineParts = tableDef
        .split('\n')
        .map((line) => line.replace(/\s--.*$/, '').trim())
        .filter((line) => line.length > 0);
      const lines = this.normalizeMultilineConstraints(lineParts);
      const tableNameMatch = lines[0].match(/create table\s+("?[\w\d_]+"?)/i);

      if (!tableNameMatch) return;

      const tableName = tableNameMatch[1];
      this.addTableToStructure(tableName, fileName);

      // discern columns
      lines.slice(1).forEach((sqlLine) => {
        const line = sqlLine.toLowerCase();
        // these are added by default for best practices.
        // need to add a config for uuid vs auto incremented primary key.
        if (
          !line ||
          line.startsWith('PRIMARY KEY') ||
          line.startsWith('--') ||
          line.startsWith('created_at') ||
          line.startsWith('updated_at') ||
          line.startsWith('deleted_at')
        ) {
          return;
        }

        if (line.startsWith('CREATE TABLE')) {
          console.error(
            `🚨 Table merge detected! Check parsing logic at: ${sqlLine}`,
          );
          return; // Skip processing this as a field
        }

        const parts = (sqlLine
          .replace(/,$/, '') // Remove trailing commas
          .replace(/\s{2,}/g, ' ') // remove double spacing causing issues
          .match(/(\w+\([^)]+\)|'[^']*'|\S+)/g) || []) as string[];

        if (parts.length < 2) return;
        const colName = parts[0];
        const colType = parts[1];
        // will need to manage this by default in other Controllers.
        if (colName.toUpperCase() === 'ID') return;

        if (line.toLowerCase().startsWith('constraint')) {
          // handle constraints
          const constraint = this.extractConstraint(line);
          if (constraint) {
            this.addConstraintToStructureAtIndex(fileName, index, constraint);
          }
          return;
        }

        const upperColType = colType.toUpperCase();
        let tableInit;
        if (
          upperColType.includes('ENUM') ||
          upperColType.includes('VARCHAR') ||
          upperColType.includes('DECIMAL') ||
          upperColType.includes('NUMERIC') ||
          new RegExp(colType, 'i').test(colType)
        ) {
          if (upperColType.includes('ENUM')) {
            const enums = sqlTypeParsers.ENUM(
              colType,
              colName || 'unavailable',
              tableName,
            );
            try {
              this.checkEnumValidity(enums.enumValues);
            } catch (error) {
              throw new Error(error as any);
            }
            tableInit = enums;
          } else if (upperColType.includes('VARCHAR')) {
            tableInit = sqlTypeParsers.VARCHAR(colType, colName || 'unavailable');
          } else if (upperColType.includes('DECIMAL')) {
            tableInit = sqlTypeParsers.DECIMAL(colType, colName || 'unavailable');
          } else if (upperColType.includes('NUMERIC')) {
            tableInit = sqlTypeParsers.NUMERIC(colType, colName || 'unavailable');
          } else if (sqlTypeParsers[upperColType]) {
            tableInit = sqlTypeParsers[upperColType](
              colType,
              colName || 'unavailable',
            );
          } else {
            throw new Error(
              `Error parsing sql, Check your sql input at ${tableName} => ${colName}: type = ${colType}`,
            );
          }
        }

        const sensitive = /password|token|secret|hash|ssn|credit|private/i.test(
          colName,
        );
        const sortable = [
          'INT',
          'DECIMAL',
          'UUID',
          'DATE',
          'TIMESTAMP',
          'VARCHAR',
        ].includes(colType);

        const tableColumn: TableColumnStructureBase = {
          nullable: true,
          isRequired: false,
          unique: false,
          primary: false,
          sensitive,
          searchable: ['VARCHAR', 'TEXT'].includes(colType) && !sensitive,
          sortable,
          filterable:
            sortable || tableInit.enumValues?.length > 0 || colType === 'BOOLEAN',
          fileOriginatorName: fileName,
          pascalCase: snakeToPascalCase(colName),
          camelCase: snakeToCamel(colName),
          capSentenceCase: snakeToCapSentence(colName),
          rawDefinition: line,
          description: inferDescriptionFromSql(colName, tableInit.enumValues),
          example: inferExampleFromSql(colName, colType, tableInit.enumValues),
          ...tableInit,
        };

        if (indexDictionary[tableName] && indexDictionary[tableName][colName]) {
          tableColumn.indexes = {
            name: indexDictionary[tableName][colName],
            columns: [colName],
            unique: false,
            method: this.extractIndexMethod(sqlLine),
          };
        }

        if (typesDictionary[colType]) {
          // this is an outline enum instead of inline and will have different values than the inline enums.
          tableColumn.enumName = colType;
          tableColumn.enumValues = typesDictionary[colType];
          const enums = sqlTypeParsers.ENUM(
            colType,
            colName || 'unavailable',
            tableName,
          );
          try {
            this.checkEnumValidity(enums.enumValues);
          } catch (error) {
            throw new Error(error as any);
          }
          tableColumn.type = enums.type;
          tableColumn.name = enums.name;
          tableColumn.inputType = enums.inputType;
        }

        if (parts.includes('PRIMARY') && parts.includes('KEY')) {
          tableColumn.primary = true;
          tableColumn.nullable = false;
          tableColumn.isRequired = true;
        }

        if (parts.includes('UNIQUE')) {
          tableColumn.unique = true;
        }

        if (parts.includes('NOT') && parts.includes('NULL')) {
          tableColumn.nullable = false;
          tableColumn.isRequired = true;
        }

        if (parts.includes('DEFAULT')) {
          tableColumn.default = parts[parts.indexOf('DEFAULT') + 1].replace(
            /'/g,
            '',
          );
        }

        const fkMatch = line.match(/references (\w+)\((\w+)\)/);
        if (fkMatch) {
          const [_, refTable, refColumn] = fkMatch;
          tableColumn.reference = {
            tableName: refTable,
            colName: refColumn,
          };
          if (line.includes('ON DELETE')) {
            if (line.includes('SET NULL')) {
              tableColumn.reference.onDelete = 'SET NULL';
            }
            if (line.includes('CASCADE')) {
              tableColumn.reference.onDelete = 'CASCADE';
            }
            if (line.includes('RESTRICT')) {
              tableColumn.reference.onDelete = 'RESTRICT';
            }
            if (line.includes('NO ACTION')) {
              tableColumn.reference.onDelete = 'NO ACTION';
            }
          }
        }

        tableColumn.validationRules = generateValidationRules(
          colName,
          colType,
          tableColumn.type,
          tableColumn.enumValues,
          tableColumn.isRequired,
        );

        this.addColumnToStructure(tableName, tableColumn, fileName);
      });
    });
  }
  private extractTypes(types: string[]) {
    return types.reduce<Record<string, string[]>>((acc, statement) => {
      const match = statement.match(/CREATE TYPE (\w+) AS ENUM\s*\(([^)]+)\)/i);
      if (!match) return acc;

      const [, enumName, valuesRaw] = match;

      const values = valuesRaw
        .split(',')
        .map((v) => v.trim().replace(/^'+|'+$/g, '')) // remove quotes
        .filter(Boolean);

      acc[enumName] = values;
      return acc;
    }, {});
  }
  private extractIndexes(indexes: string[]) {
    return indexes.reduce<Record<string, Record<string, string>>>(
      (acc, statement) => {
        const match = statement.match(/CREATE INDEX (\w+) ON (\w+)\((\w+)\)/i);
        if (!match) return acc;

        const [, indexName, tableName, columnName] = match;

        if (!acc[tableName]) acc[tableName] = {};
        acc[tableName][columnName] = indexName;

        return acc;
      },
      {},
    );
  }

  private handleSqlExtraction(sql: string, fileName: string) {
    const trimmedSql = sql.trim();
    const statements = trimmedSql
      .split(/(?:^|\n)(?=CREATE\s|create\s|ALTER\s|alter\s)/g)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const { tables, types, indexes, alterConstraints } = statements.reduce<{
      tables: string[];
      types: string[];
      indexes: string[];
      alterConstraints: string[];
    }>(
      (acc, statement) => {
        const normalized = statement.toLowerCase();

        // CREATE TABLE
        if (normalized.startsWith('create table')) {
          acc.tables.push(statement);
        } else if (normalized.startsWith('create type')) {
          acc.types.push(statement);
        } else if (normalized.startsWith('create index')) {
          acc.indexes.push(statement);
        } else if (normalized.startsWith('alter table')) {
          acc.alterConstraints.push(statement);
        }

        return acc;
      },
      {
        tables: [],
        types: [],
        indexes: [],
        alterConstraints: [],
      },
    );

    // extract inline foreign keys and constraints
    const indexDictionary = this.extractIndexes(indexes);
    const typesDictionary = this.extractTypes(types);

    this.extractTables(
      tables,
      fileName,
      indexDictionary,
      typesDictionary,
      alterConstraints,
    );
  }

  async processFiles() {
    if (this.filesToProcess.length === 0 || !this.directoryPath) {
      console.error(
        'No files to process or directory path, use getFiles prior to processing',
      );
      return;
    }

    if (!this.directoryPath) {
      console.error(
        'No files to process or directory path, use getFiles prior to processing',
      );
      return;
    }

    //sequential processing in order to keep structure in tact.Can do things in parallel after
    for (const file of this.filesToProcess) {
      const filePath = path.join(this.directoryPath as string, file);
      const fileContent = await readFile(filePath, 'utf8');
      try {
        this.handleSqlExtraction(fileContent, file);
      } catch (error) {
        console.error('stopped processing because of a sql error when parsing:');
        // run cleanup
        throw new Error(error as any);
      }
    }
  }
}
