function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) {
    return [];
  }

  const result: T[] = [];
  const firstArray: T[] = arrays[0];

  for (const item of firstArray) {
    if (result.includes(item)) {
      continue;
    }

    let isCommon = true;

    for (let i = 1; i < arrays.length; i++) {
      if (!arrays[i].includes(item)) {
        isCommon = false;
        break;
      }
    }

    if (isCommon) {
      result.push(item);
    }
  }

  return result;
}

export default intersection;
