import { APIData, BuildDataServicesPayload, TemplateToBuild } from '../../../@types';

export class TypeORMServiceBuilder {
  static build(
    apis: APIData[],
    apiFolders: Record<string, Record<string, BuildDataServicesPayload>>,
    dataServicePath: string,
    typescriptPath: string,
  ): TemplateToBuild[] {
    return [];
  }
}
