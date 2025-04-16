export const typedefsTypesTemplate = `
export type EnumAccumulatorType = {
  [key: string]: { value: string };
};

export type DictionaryAccumulatorType<T> = {
  [key: string]: T;
};
`
