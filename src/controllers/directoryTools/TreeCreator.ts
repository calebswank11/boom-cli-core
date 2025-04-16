import { TreeStructureManager } from './TreeStructureManager';
import path from 'path';
import { FolderCreator } from './FolderCreator';
import { FileCreator } from './FileCreator';

export class TreeCreator {
  private treeStructure: TreeStructureManager;

  constructor(treeStructure: TreeStructureManager) {
    this.treeStructure = treeStructure;
  }

  async createFoldersFromMap(folderObj: Record<string, any>) {
    const folderCreator = new FolderCreator();
    for (const key in folderObj) {
      const isFiles = key === 'files';
      if (typeof folderObj[key] === 'string' && !isFiles) {
        await folderCreator.createFolder(folderObj[key]);
      } else {
        if (!isFiles) await this.createFoldersFromMap(folderObj[key]); // Recursively create subdirectories
      }
    }
  }

  async createFilesFromMap(folderObj: Record<string, any>, basePath = '') {
    const fileCreator = new FileCreator();
    for (const key in folderObj) {
      if (typeof folderObj[key] === 'object' && folderObj[key] !== null) {
        // 🔥 Handle "files" separately
        if (key === 'files') {
          for (const fileKey in folderObj[key]) {
            // Extract file path and template, allowing for optional templates
            const [filePath, fileTemplate = `// Auto-generated ${fileKey}`] =
              folderObj[key][fileKey];

            // Construct full file path
            const fullFilePath = path.join(basePath, filePath);

            const fileTemplateParts = fullFilePath.split('.');

            // Write file with extension.
            await fileCreator.createFile(
              fullFilePath,
              fileTemplate,
              fileTemplateParts[fileTemplateParts.length - 1] || 'ts',
            );
          }
        } else {
          // 🔥 Recursively process deeper objects
          const nextBasePath = folderObj[key]?.root || basePath;

          // Ensure it's a valid path before recursing
          if (typeof nextBasePath === 'string') {
            await this.createFilesFromMap(folderObj[key], nextBasePath);
          }
        }
      }
    }
  }

  async createDirectoriesAndFiles(): Promise<void> {
    const folderMap = this.treeStructure.getTreeMap();
    await this.createFoldersFromMap(folderMap);
    await this.createFilesFromMap(folderMap);
  }
}
