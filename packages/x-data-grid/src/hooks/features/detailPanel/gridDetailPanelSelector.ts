import { GridRowId } from '../../../models/gridRows';
import { GridState } from '../../../models/gridStateCommunity';
import { createSelector } from '../../../utils/createSelector';

export const gridDetailPanelExpandedRowIdsSelector = (state: GridState) =>
  state.detailPanel.expandedRowIds;

export const gridDetailPanelIsExpandedForRowIdSelector = createSelector(
  gridDetailPanelExpandedRowIdsSelector,
  (expandedRowIds, rowId: GridRowId) => expandedRowIds.has(rowId),
);
