import chalk from 'chalk';
import { readFile, writeFile } from 'fs/promises';
import ora from 'ora';
import path from 'path';
import { formatCode } from '../../utils/stringUtils';

export class FileCreator {
  private directoryCounts: Map<string, number> = new Map();
  private directoryLoaders: Map<string, ReturnType<typeof ora>> = new Map();
  private currentDirectory: string | null = null;
  private isProcessing: boolean = false;

  private getDirectoryFromPath(filePath: string): string {
    return path.dirname(filePath);
  }

  private getColoredCount(count: number): string {
    if (count > 30) return chalk.greenBright(count.toString());
    if (count > 11) return chalk.green(count.toString());
    if (count < 10) return chalk.grey(count.toString());
    return count.toString();
  }

  private updateDirectoryCount(directory: string) {
    if (!this.isProcessing) return;

    const currentCount = this.directoryCounts.get(directory) || 0;
    this.directoryCounts.set(directory, currentCount + 1);

    // Update the loader text
    const loader = this.directoryLoaders.get(directory);
    if (loader) {
      loader.text = `${directory}: ${this.getColoredCount(currentCount + 1)} files generated`;
    }
  }

  private startDirectoryLoader(directory: string) {
    if (!this.isProcessing) return;

    if (!this.directoryLoaders.has(directory)) {
      const loader = ora(`${directory}: ${this.getColoredCount(0)} files generated`).start();
      this.directoryLoaders.set(directory, loader);
    }
  }

  private stopDirectoryLoader(directory: string) {
    if (!this.isProcessing) return;

    const loader = this.directoryLoaders.get(directory);
    if (loader) {
      const count = this.directoryCounts.get(directory) || 0;
      loader.succeed(`${directory}: ${this.getColoredCount(count)} files generated`);
      this.directoryLoaders.delete(directory);
    }
  }

  // Clean up all loaders to prevent hanging
  public cleanup() {
    // Stop all active loaders
    for (const [directory, loader] of this.directoryLoaders.entries()) {
      try {
        loader.succeed(`${directory}: ${this.directoryCounts.get(directory)} files generated`);
      } catch (e) {
        // Ignore errors during cleanup
      }
    }

    // Clear all maps
    this.directoryLoaders.clear();
    this.directoryCounts.clear();
    this.currentDirectory = null;
    this.isProcessing = false;
  }

  async createOrAppendFile(
    filePath: string,
    content: string,
    formatType?: string,
    cleanupFunction?: (prevContent: string, newContent: string) => string,
  ) {
    if (!this.isProcessing) {
      this.isProcessing = true;
    }

    try {
      const directory = this.getDirectoryFromPath(filePath);

      // If we're starting a new directory, stop the previous loader
      if (this.currentDirectory && this.currentDirectory !== directory) {
        this.stopDirectoryLoader(this.currentDirectory);
      }

      // Start a new loader for this directory if needed
      if (this.currentDirectory !== directory) {
        this.startDirectoryLoader(directory);
        this.currentDirectory = directory;
      }

      let existingContent = '';

      try {
        existingContent = await readFile(filePath, 'utf-8');
        // Don't log individual file operations
      } catch {
        // Don't log individual file operations
      }

      let finalContent = '';

      if (cleanupFunction) {
        // 🛠 Split content into separate type/interface blocks
        finalContent = cleanupFunction(existingContent, content);
      }

      await this.createFile(filePath, finalContent);
      this.updateDirectoryCount(directory);
    } catch (error) {
      console.error(`Error creating/appending file ${filePath}:`, error);
      // Ensure we clean up even if there's an error
      this.cleanup();
      throw error;
    }
  }

  async createFile(filePath: string, content: string, formatType?: string) {
    if (!this.isProcessing) {
      this.isProcessing = true;
    }

    try {
      const formattedTemplate = await formatCode(content, formatType);
      const pathWithBase = path.join(filePath);
      await writeFile(pathWithBase, formattedTemplate, { flag: 'w' });
      // Don't log individual file operations
    } catch (error) {
      console.error(`Error creating file ${filePath}:`, error);
      throw error;
    }
  }

  async createFiles(
    files: {
      path: string;
      content: string;
    }[],
  ) {
    this.isProcessing = true;

    try {
      // Group files by directory
      const filesByDirectory = new Map<string, typeof files>();

      for (const file of files) {
        const directory = this.getDirectoryFromPath(file.path);
        if (!filesByDirectory.has(directory)) {
          filesByDirectory.set(directory, []);
        }
        filesByDirectory.get(directory)!.push(file);
      }

      // Process each directory
      for (const [directory, directoryFiles] of filesByDirectory.entries()) {
        this.startDirectoryLoader(directory);
        this.currentDirectory = directory;

        for (const { path, content } of directoryFiles) {
          await this.createFile(path, content);
          this.updateDirectoryCount(directory);
        }

        this.stopDirectoryLoader(directory);
      }

      // Reset current directory
      this.currentDirectory = null;
    } catch (error) {
      console.error('Error creating files:', error);
      // Ensure we clean up even if there's an error
      this.cleanup();
      throw error;
    } finally {
      // Always clean up to prevent hanging
      this.cleanup();
    }
  }
}
