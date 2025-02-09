import { createSelector } from '../../../utils/createSelector';
import { GridStateCommunity } from '../../../models/gridStateCommunity';
import { GridRowId } from '../../../models/gridRows';

export const gridDetailPanelExpandedRowIdsSelector = (state: GridStateCommunity) =>
  state.detailPanel.expandedRowIds;

export const gridDetailPanelIsExpandedForRowIdSelector = createSelector(
  gridDetailPanelExpandedRowIdsSelector,
  (expandedRowIds, rowId: GridRowId) => expandedRowIds.has(rowId),
);
