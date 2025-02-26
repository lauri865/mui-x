import { GridState } from '../../../models/gridStateCommunity';
import { createSelector } from '../../../utils/createSelector';

const gridRowSpanningStateSelector = (state: GridState) => state.rowSpanning;

export const gridRowSpanningHiddenCellsSelector = createSelector(
  gridRowSpanningStateSelector,
  (rowSpanning) => rowSpanning.hiddenCells,
);

export const gridRowSpanningSpannedCellsSelector = createSelector(
  gridRowSpanningStateSelector,
  (rowSpanning) => rowSpanning.spannedCells,
);

export const gridRowSpanningHiddenCellsOriginMapSelector = createSelector(
  gridRowSpanningStateSelector,
  (rowSpanning) => rowSpanning.hiddenCellOriginMap,
);
