export const categorizeFolders = (tableNames: string[]) => {
  const tableDict = tableNames.reduce<Record<string, number>>((acc, cur) => {
    const parts = cur.split('_');
    parts.map((part) => (acc[part] ? (acc[part] = acc[part] + 1) : (acc[part] = 1)));

    return acc;
  }, {});

  const commonTables = Object.keys(tableDict).filter((key) => tableDict[key] >= 3);

  const commonTableDict = commonTables.reduce<Record<string, string[]>>(
    (acc, cur) => ({
      ...acc,
      [cur]: [],
    }),
    {
      misc: [],
    },
  );

  tableNames.forEach((tn) => {
    const parts = tn.split('_');
    let addedToCategory = false; // Flag to check if the table is added to a category

    commonTables.forEach((ct) => {
      if (parts.includes(ct)) {
        commonTableDict[ct].push(tn);
        addedToCategory = true; // Set flag as true when added
      }
    });

    // Only push to misc if not added to a category already
    if (!addedToCategory) {
      commonTableDict.misc.push(tn);
    }
  });

  return commonTableDict;
};

export const invertCategorizedFolders = (
  categorizedFolders: Record<string, string[]>,
): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const [category, keys] of Object.entries(categorizedFolders)) {
    keys.forEach((key) => {
      result[key] = category;
    });
  }

  return result;
};

export const mapItemToFolder = <T>(
  categorizedTables: Record<string, string[]>,
  objectTypes: T[],
) => {
  const tableMap = Object.keys(categorizedTables).map(
    (key) => `${key}|${categorizedTables[key].join(',')}`,
  );

  return objectTypes.reduce<Record<string, T[]>>((acc, cur) => {
    let itemAdded = false;
    tableMap.map((folder) => {
      const folderName = folder.split('|')[0];
      // @ts-ignore name DOES exist on both the instances of this use.
      if (folder.includes(cur.name) && !itemAdded) {
        itemAdded = true;
        if (acc[folderName]) {
          acc[folderName].push(cur);
        } else {
          acc[folderName] = [cur];
        }
      }
    });
    return acc;
  }, {});
};
