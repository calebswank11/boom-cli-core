function nonIntersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) {
    return [];
  }

  const allItems: T[] = arrays.flat();
  const result: T[] = [];

  for (const item of allItems) {
    if (result.includes(item)) {
      continue;
    }

    let isCommon = true;

    for (let i = 0; i < arrays.length; i++) {
      if (!arrays[i].includes(item)) {
        isCommon = false;
        break;
      }
    }

    if (!isCommon) {
      result.push(item);
    }
  }

  return result;
}

export default nonIntersection;
