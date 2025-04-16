import { readFile, writeFile } from 'fs/promises';
import { formatCode } from '../../utils/stringUtils';
import path from 'path';

export class FileCreator {
  async createOrAppendFile(
    path: string,
    content: string,
    formatType?: string,
    cleanupFunction?: (prevContent: string, newContent: string) => string,
  ) {
    let existingContent = '';

    try {
      existingContent = await readFile(path, 'utf-8');
      console.log(`Appending to existing file: ${path}`);
    } catch {
      console.log(`Creating new file: ${path}`);
    }

    let finalContent = '';

    if (cleanupFunction) {
      // 🛠 Split content into separate type/interface blocks
      finalContent = cleanupFunction(existingContent, content);
    }

    await this.createFile(path, finalContent);
  }

  async createFile(filePath: string, content: string, formatType?: string) {
    const formattedTemplate = await formatCode(content, formatType);
    const pathWithBase = path.join(filePath);
    await writeFile(pathWithBase, formattedTemplate, { flag: 'w' });
    console.log(`Generated file: ${pathWithBase}`);
  }

  async createFiles(
    files: {
      path: string;
      content: string;
    }[],
  ) {
    for (const { path, content } of files) {
      await this.createFile(path, content);
    }
  }
}
