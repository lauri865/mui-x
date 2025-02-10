import { GridEditMode, GridEditModes } from '../../../models/gridEditRowModel';
import { GridRowId } from '../../../models/gridRows';
import { GridStateCommunity } from '../../../models/gridStateCommunity';
import { createSelector } from '../../../utils/createSelector';

/**
 * Select the row editing state.
 */
export const gridEditRowsStateSelector = (state: GridStateCommunity) => state.editRows;

export const gridRowIsEditingSelector = createSelector(
  gridEditRowsStateSelector,
  (editRows, { rowId, editMode }: { rowId: GridRowId; editMode: GridEditMode }) =>
    editMode === GridEditModes.Row && Boolean(editRows[rowId]),
);

export const gridEditCellStateSelector = createSelector(
  gridEditRowsStateSelector,
  (
    editRows,
    {
      rowId,
      field,
    }: {
      rowId: GridRowId;
      field: string;
    },
  ) => editRows[rowId]?.[field] ?? null,
);
