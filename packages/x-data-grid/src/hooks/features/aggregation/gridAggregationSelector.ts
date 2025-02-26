import { GridState } from '../../../models/gridStateCommunity';

export const gridAggregationModelSelector = (state: GridState) => state.aggregation.model;

export const gridAggregationLookupSelector = (state: GridState) => state.aggregation.lookup;
