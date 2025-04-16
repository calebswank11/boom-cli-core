export enum ApiTypesEnum {
  graphql = 'graphql',
  rest = 'rest',
}
export const ApiTypes = Object.values(ApiTypesEnum);
export enum ORMEnum {
  knex = 'knex',
  prisma = 'prisma',
  sequelize = 'sequelize',
  typeorm = 'typeorm',
}
export const ORMs = Object.values(ORMEnum);

export enum LibrariesEnum {
  express = 'express',
  nestjs = 'nestjs',
  apollo_server = 'apollo-server',
}
export const Libraries = Object.values(LibrariesEnum);

export enum AuthMethodsEnum {
  jwt = 'jwt',
  session = 'session',
  oauth = 'oauth',
  none = 'none',
}
export const AuthMethods = Object.values(AuthMethodsEnum);

export enum RateLimitingTypesEnum {
  basic = 'basic',
  advanced = 'advanced',
  none = 'none',
}
export const RateLimitingTypes = Object.values(RateLimitingTypesEnum);

export enum DeploymentTargetsEnum {
  vercel = 'vercel',
  netlify = 'netlify',
  aws = 'aws',
  self = 'self-hosted',
}
export const DeploymentTargets = Object.values(DeploymentTargetsEnum);

export enum FrameworksEnum {
  react = 'react',
  vue = 'vue',
  svelte = 'svelte',
  solid = 'solid',
}
export const Frameworks = Object.values(FrameworksEnum);

export enum ClientLibrariesEnum {
  axios = 'axios',
  apollo_client = 'apollo-client',
  vue_apollo = 'vue-apollo',
  solid_apollo = 'solid-apollo',
  svelte_apollo = 'svelte-apollo',
  fetch = 'fetch',
  superagent = 'superagent',
  got = 'got',
}
export const ClientLibraries = Object.values(ClientLibrariesEnum);

export enum StateManagementTypesEnum {
  redux = 'redux',
  zustand = 'zustand',
  mobx = 'mobx',
  none = 'none',
}
export const StateManagementTypes = Object.values(StateManagementTypesEnum);

export enum UILibrariesEnum {
  tailwind = 'tailwind',
  mui = 'mui',
  chakra = 'chakra',
  none = 'none',
}
export const UILibraries = Object.values(UILibrariesEnum);
export enum CI_CDOptionsEnum {
  github_actions = 'github-actions',
  gitlab_ci = 'gitlab-ci',
  none = 'none',
}
export const CI_CDOptions = Object.values(CI_CDOptionsEnum);
export enum IaCToolTypesEnum {
  cdk = 'cdk',
  terraform = 'terraform',
  pulumi = 'pulumi',
  none = 'none',
}
export const IaCToolTypes = Object.values(IaCToolTypesEnum);
export enum CloudProvidersEnum {
  aws = 'aws',
  gcp = 'gcp',
  azure = 'azure',
  none = 'none',
}
export const CloudProviders = Object.values(CloudProvidersEnum);
export enum LicensesEnum {
  MIT = 'MIT',
  Apache_2_0 = 'Apache-2.0',
  GPL_3_0 = 'GPL-3.0',
  BSD_3_Clause = 'BSD-3-Clause',
  ISC = 'ISC',
  Unlicense = 'Unlicense',
  Proprietary = 'Proprietary',
  Other = 'Other',
}
export const Licenses = Object.values(LicensesEnum);

export enum CLIOptionsRoot {
  apiType = 'apiType',
  orm = 'orm',
  library = 'library',
  frontend = 'frontend',
  infra = 'infra',
  cicd = 'cicd',
}

export const CLIOptionsKeys = Object.values(CLIOptionsRoot);
