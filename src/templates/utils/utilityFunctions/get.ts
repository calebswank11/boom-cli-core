export const getTemplate = `
function get<T>(
  obj: T,
  path: string | string[],
  defaultValue?: any,
): any {
  if (!path) {
    return defaultValue;
  }

  const fullPath = Array.isArray(path)
    ? path
    : path
        .replace(/\\[(\\w+)\\]/g, '.$1')
        .split('.')
        .filter(Boolean);

  let result: any = obj;
  for (const key of fullPath) {
    result =
      result != null && key in Object(result)
        ? result[key]
        : undefined;
    if (result === undefined) {
      return defaultValue;
    }
  }

  return result;
}

export default get;

`;
