import { mkdir } from 'fs/promises';
import path from 'path';

export class FolderCreator {
  async createFolder(folderPath: string) {
      const pathWithBase = path.join(folderPath);
      await mkdir(pathWithBase, { recursive: true });
      // if(process.env.NODE_ENV !== 'production') {
      //   console.log(`Generated folder: ${pathWithBase}`);
      // }
  }

  async createFolders(folders: string[]) {
      for (const folder of folders) {
          await this.createFolder(folder);
        }
  }
}
