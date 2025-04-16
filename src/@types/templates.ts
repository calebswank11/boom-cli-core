export type TemplateFile = string;
export type TemplatePath = string;
export type TemplateFolder = string;

export interface TemplateToBuild {
  template: TemplateFile;
  path: TemplatePath;
  folder?: TemplateFolder;
}
