export const importAllDataServicesTemplate = (folders: string[]) =>
  folders.map((folder) => `export * from './${folder}';`).join('\n');
