import { TypescriptBase, TypescriptData } from '../@types';

export function buildTypescriptData(typescriptData: Record<string, TypescriptData>) {
  const ormTypes: [string, string][] = [];
  const typescriptRegistryData: TypescriptBase[] = [];
  const typescript: TypescriptBase = {
    contents: '',
    enums: [],
  };

  Object.keys(typescriptData).map((typescriptType) => {
    const ts = typescriptData[typescriptType];
    ormTypes.push([typescriptType, ts.tableName]);
    typescript.contents += `export interface ${typescriptType} extends TableDefaults {\n`;
    Object.values(ts.values).forEach((value) => {
      if (
        ![
          // Omit TableDefaults values
          'id',
          'created_at',
          'updated_at',
          'deleted_at',
        ].includes(value.name)
      ) {
        if (value.enumResponse) {
          typescript.enums.push(value.value);
        }
        const isRequired = value.required ? ':' : '?:';
        const tsType = value.enumResponse || value.value;
        typescript.contents += `${value.name}${isRequired}${tsType};\n`;
      }
    });
    typescript.contents += `}\n`;
  });
  typescriptRegistryData.push(typescript);
  return {
    typescriptBase: typescriptRegistryData,
    ormTypes,
  };
}
