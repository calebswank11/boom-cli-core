import {
  ApiTypes,
  AuthMethods,
  CI_CDOptions,
  ClientLibraries,
  CloudProviders,
  DeploymentTargets,
  Frameworks,
  IaCToolTypes,
  Libraries,
  Licenses,
  ORMs,
  RateLimitingTypes,
  StateManagementTypes,
  UILibraries,
} from './constants';

export type ApiType = (typeof ApiTypes)[number];
export type Orm = (typeof ORMs)[number];
export type Library = (typeof Libraries)[number];

export type AuthMethod = (typeof AuthMethods)[number];
export type RateLimiting = (typeof RateLimitingTypes)[number];
export type DeploymentTarget = (typeof DeploymentTargets)[number];
export type Framework = (typeof Frameworks)[number];
export type ClientLibrary = (typeof ClientLibraries)[number];
export type StateManagement = (typeof StateManagementTypes)[number];
export type UILibrary = (typeof UILibraries)[number];
export type CI_CD = (typeof CI_CDOptions)[number];
export type IaCTool = (typeof IaCToolTypes)[number];
export type CloudProvider = (typeof CloudProviders)[number];
export type License = (typeof Licenses)[number];

export interface CLIOptions {
  config?: string;
  orm?: Orm;
  apiType?: ApiType;
  library?: Library;
  frontEnd?: Framework & 'no';
  infra?: boolean;
  interactive?: boolean;
}
