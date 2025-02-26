import { GridRowEntry, GridValidRowModel } from '../../../models/gridRows';
import { GridState } from '../../../models/gridStateCommunity';
import { createSelector, createSelectorMemoized } from '../../../utils/createSelector';

export const gridPinnedRowsModelSelector = (state: GridState) => state.pinnedRows;

const gridRowsLookupSelector = (state: GridState) => state.rows.dataRowIdToModelLookup;

export const gridVisiblePinnedRowsSelector = createSelectorMemoized(
  gridRowsLookupSelector,
  gridPinnedRowsModelSelector,
  (rowsLookup, pinnedRows) => {
    return {
      top: pinnedRows.top.reduce((acc, id) => {
        if (rowsLookup[id] !== undefined) {
          acc.push({ id, model: rowsLookup[id] });
        }
        return acc;
      }, [] as GridRowEntry<GridValidRowModel>[]),
      bottom: pinnedRows.bottom.reduce((acc, id) => {
        if (rowsLookup[id] !== undefined) {
          acc.push({ id, model: rowsLookup[id] });
        }
        return acc;
      }, [] as GridRowEntry<GridValidRowModel>[]),
    };
  },
);

export const gridVisiblePinnedRowsCountSelector = createSelector(
  gridVisiblePinnedRowsSelector,
  (visiblePinnedRows) => visiblePinnedRows.top.length + visiblePinnedRows.bottom.length,
);
