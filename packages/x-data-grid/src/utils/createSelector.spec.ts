import { RefObject } from '@mui/x-internals/types';
import { GridApi } from '../models/api/gridApiCommunity';
import { GridState } from '../models/gridStateCommunity';
import { createSelector } from './createSelector';

interface GridCustomState extends GridState {
  customKey: { customKeyBis: number };
}

createSelector(
  // @ts-expect-error The state must be typed with GridState
  (state: unknown) => state.columns.orderedFields,
  (fields: any) => fields,
);

createSelector(
  // @ts-expect-error Missing combiner function
  (state: GridState) => state.columns.orderedFields,
  (state: GridState) => state.columns.lookup,
);

createSelector(
  (state: GridState) => state.columns.orderedFields,
  (fields) => fields,
  // @ts-expect-error Wrong state value
)(null);

createSelector(
  (state: GridState) => state.columns.orderedFields,
  (fields) => fields,
)({} as RefObject<GridApi>);

createSelector(
  (state: GridState) => state.columns.orderedFields,
  (fields) => fields,
)({} as GridState, undefined, { id: 1 });

createSelector(
  // @ts-expect-error Wrong state key
  (state: GridState) => state.customKey,
  (customKey) => customKey.custmKeyBis,
);

createSelector(
  (state: GridCustomState) => state.customKey,
  (customKey) => customKey.customKeyBis,
);
