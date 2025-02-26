import { GridState } from '../../../models/gridStateCommunity';
import { createSelector } from '../../../utils/createSelector';
import { gridColumnLookupSelector } from '../columns';

export const gridRowGroupingModelSelector = (state: GridState) => state.rowGrouping.model;

export const gridFilteredRowGroupingModel = createSelector(
  gridColumnLookupSelector,
  gridRowGroupingModelSelector,
  (columns, rowGroupingModel) => {
    return rowGroupingModel.filter((field) => columns[field] != null);
  },
);

export const gridRowGroupingDefaultExpansionDepthSelector = (state: GridState) =>
  state.rowGrouping.defaultExpansionDepth;
