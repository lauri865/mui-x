import { GridRowId, GridRowModel } from '../../../models/gridRows';
import { GridState } from '../../../models/gridStateCommunity';
import { createSelector, createSelectorMemoized } from '../../../utils/createSelector';
import { gridRowsLookupSelector } from '../rows/gridRowsSelector';

export const gridRowSelectionStateSelector = (state: GridState) => state.rowSelection;

export const selectedGridRowsCountSelector = createSelector(
  gridRowSelectionStateSelector,
  (selection) => selection.length,
);

export const selectedGridRowsSelector = createSelectorMemoized(
  gridRowSelectionStateSelector,
  gridRowsLookupSelector,
  (selectedRows, rowsLookup) =>
    new Map<GridRowId, GridRowModel>(selectedRows.map((id) => [id, rowsLookup[id]])),
);

export const selectedIdsLookupSelector = createSelectorMemoized(
  gridRowSelectionStateSelector,
  (selection) =>
    selection.reduce<Record<GridRowId, GridRowId>>((lookup, rowId) => {
      lookup[rowId] = rowId;
      return lookup;
    }, {}),
);
