import { GridState } from '../../../models/gridStateCommunity';
import { createSelector } from '../../../utils/createSelector';

export const gridColumnResizeSelector = (state: GridState) => state.columnResize;

export const gridResizingColumnFieldSelector = createSelector(
  gridColumnResizeSelector,
  (columnResize) => columnResize.resizingColumnField,
);
