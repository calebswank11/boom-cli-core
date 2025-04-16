export const deepCloneTemplate = `
function deepClone<T>(obj: T): T {
  // Handle null and primitive types
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  // Handle objects
  const clonedObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(
        (obj as { [key: string]: any })[key],
      );
    }
  }

  return clonedObj as T;
}

export default deepClone;
`;
