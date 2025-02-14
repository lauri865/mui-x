import { GridStateCommunity } from '../../../models/gridStateCommunity';

export const gridAggregationModelSelector = (state: GridStateCommunity) => state.aggregation.model;

export const gridAggregationLookupSelector = (state: GridStateCommunity) =>
  state.aggregation.lookup;
