import { GridStateCommunity } from '../../../models/gridStateCommunity';

export const gridPinnedRowsStateSelector = (state: GridStateCommunity) => state.pinnedRows;

export const gridpinnedRowsModelSelector = (state: GridStateCommunity) => state.pinnedRows.model;
