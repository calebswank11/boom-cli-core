import { readdir, readFile } from 'fs/promises';
import path from 'path';
import {
  snakeToCamel,
  snakeToCapSentence,
  snakeToPascalCase,
} from '../../utils/stringUtils';
import { TableColumnStructureBase, TableStructureByFile } from '../../@types';
import { sqlTypeParsers } from '../../helpers';

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

  private handleSqlExtraction(sql: string, fileName: string) {
    const tables = sql.trim().split(/(?:CREATE TABLE|create table) /);

    tables.forEach((tableDef) => {
      const lines = tableDef.split('\n').map((line) => line.trim());
      const tableNameMatch = lines[0].match(/^(\w+)/);

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
          } else {
            if (sqlTypeParsers[upperColType]) {
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
        }

        const tableColumn: Partial<TableColumnStructureBase> = {
          nullable: true,
          unique: false,
          primary: false,
          ...tableInit,
        };

        if (parts.includes('PRIMARY') && parts.includes('KEY')) {
          tableColumn.primary = true;
          tableColumn.nullable = false;
        }

        if (parts.includes('UNIQUE')) {
          tableColumn.unique = true;
        }

        if (parts.includes('NOT') && parts.includes('NULL')) {
          tableColumn.nullable = false;
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
          if (line.includes('ON DELETE CASCADE')) {
            tableColumn.reference.onDelete = 'CASCADE';
          }
        }

        this.addColumnToStructure(
          tableName,
          tableColumn as TableColumnStructureBase,
          fileName,
        );
      });
    });
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
