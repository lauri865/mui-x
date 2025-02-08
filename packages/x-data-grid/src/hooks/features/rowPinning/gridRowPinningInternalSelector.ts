import { createSelectorMemoized } from '../../../utils/createSelector';
import {
  gridPaginatedVisibleSortedGridRowIdsSelector,
  gridVisibleRowsSelector,
} from '../pagination/gridPaginationSelector';
import { gridVisiblePinnedRowsSelector } from './gridRowPinningSelector';

export const gridVisibleRowsWithPinnedRowsSelector = createSelectorMemoized(
  gridVisibleRowsSelector,
  gridVisiblePinnedRowsSelector,
  (visibleRows, pinnedRows) => {
    return pinnedRows.top.concat(visibleRows.rows, pinnedRows.bottom);
  },
);

export const gridVisibleRowIdsWithPinnedRowsSelector = createSelectorMemoized(
  gridVisibleRowsWithPinnedRowsSelector,
  (visiblePinnedRows) => {
    return visiblePinnedRows.map((row) => row.id);
  },
);

export const gridVisiblePaginatedRowIdsWithPinnedRowsSelector = createSelectorMemoized(
  gridPaginatedVisibleSortedGridRowIdsSelector,
  gridVisiblePinnedRowsSelector,
  (visiblePinnedRows, pinnedRows) => {
    const topRowIds = pinnedRows.top.map((row) => row.id);
    const bottomRowIds = pinnedRows.bottom.map((row) => row.id);
    return topRowIds.concat(visiblePinnedRows, bottomRowIds);
  },
);
