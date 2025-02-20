import { GridColTypeDef } from '../models/colDef/gridColDef';
import { GRID_STRING_COL_DEF } from './gridStringColDef';

const arraySortComparator = (v1: Array<number | string>, v2: Array<number | string>) => {
  if (v1.length === 0 && v2.length === 0) {
    return 0;
  }
  if (v1.length === 0) {
    return -1;
  }
  if (v2.length === 0) {
    return 1;
  }
  return v1[0] < v2[0] ? -1 : 1;
};

export const GRID_ARRAY_COL_DEF: GridColTypeDef<Array<number | string>, string> = {
  ...GRID_STRING_COL_DEF,
  type: 'array',
  sortComparator: arraySortComparator,
  valueFormatter: (value) => value?.join(', ') ?? '',
  filterOperators: [],
  // @ts-ignore
  pastedValueParser: (value) => value.split(',').map((v) => v.trim()),
};
