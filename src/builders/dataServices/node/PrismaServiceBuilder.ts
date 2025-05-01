import { APIData, BuildDataServicesPayload, TemplateToBuild } from '../../../@types';

export class PrismaServiceBuilder {
  static build(
    apis: APIData[],
    apiFolders: Record<string, Record<string, BuildDataServicesPayload>>,
    dataServicePath: string,
    typescriptPath: string,
  ): TemplateToBuild[] {
    return [];
  }
}
