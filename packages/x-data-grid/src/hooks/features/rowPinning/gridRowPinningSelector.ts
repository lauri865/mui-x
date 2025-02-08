import { createSelector, createSelectorMemoized } from '../../../utils/createSelector';
import { GridStateCommunity } from '../../../models/gridStateCommunity';
import { GridRowEntry, GridValidRowModel } from '../../../models/gridRows';

export const gridPinnedRowsModelSelector = (state: GridStateCommunity) => state.pinnedRows;

const gridRowsLookupSelector = (state: GridStateCommunity) => state.rows.dataRowIdToModelLookup;

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
