export const isEmptyTemplate = `
function isEmpty(value: any): boolean {
  if (value == null) {
    return true;
  }

  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0;
  }

  if (value instanceof Object) {
    return Object.keys(value).length === 0;
  }

  return false;
}
export default isEmpty;

`;
