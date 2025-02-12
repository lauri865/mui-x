import { GridStateCommunity } from '../../../models/gridStateCommunity';
import { createSelector } from '../../../utils/createSelector';
import { gridColumnLookupSelector } from '../columns';

export const gridRowGroupingModelSelector = (state: GridStateCommunity) => state.rowGrouping.model;

export const gridFilteredRowGroupingModel = createSelector(
  gridColumnLookupSelector,
  gridRowGroupingModelSelector,
  (columns, rowGroupingModel) => {
    return rowGroupingModel.filter((field) => columns[field] != null);
  },
);

export const gridRowGroupingDefaultExpansionDepthSelector = (state: GridStateCommunity) =>
  state.rowGrouping.defaultExpansionDepth;
