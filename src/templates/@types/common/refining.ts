export const refiningTypesTemplate = `
export type SortAndFilterBase<orderBy, filterableFields> = {
  orderBy?: orderBy;
  filter?: FilterOptionBase<filterableFields>;
  direction?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
  phrase?: string;
};

export type FilterOptionBase<AdditionalFilterOptions> =
  | 'location'
  | AdditionalFilterOptions;

export type SortAndFilterBaseResp = {
  limit: number;
  offset: number;
};

export type SortAndFilterResp<T> = {
  data: T;
  total: number;
  offset: number;
  limit: number;
  phrase?: string;
};
`;
