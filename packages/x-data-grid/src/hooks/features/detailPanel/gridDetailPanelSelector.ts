import { GridRowId } from '../../../models/gridRows';
import { GridStateCommunity } from '../../../models/gridStateCommunity';
import { createSelector } from '../../../utils/createSelector';

export const gridDetailPanelExpandedRowIdsSelector = (state: GridStateCommunity) =>
  state.detailPanel.expandedRowIds;

export const gridDetailPanelIsExpandedForRowIdSelector = createSelector(
  gridDetailPanelExpandedRowIdsSelector,
  (expandedRowIds, rowId: GridRowId) => expandedRowIds.has(rowId),
);
