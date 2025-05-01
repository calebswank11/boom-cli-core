export type BuildDataServicesPayload = {
  fileName: string;
  helperImports: string[];
  typeImports: string[];
  enumImports: string[];
  typesToCreate: string[];
  dataServices: string[];
  modelImports: string[];
};
