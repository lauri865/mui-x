import type { OutputSelector } from '../utils/createSelector';
import { GridCallbackDetails } from './api/gridCallbackDetails';
import type { GridControlledStateEventLookup, GridEventLookup } from './events';
import { GridState } from './gridStateCommunity';

export interface GridControlStateItem<
  State extends GridState,
  Args,
  E extends keyof GridControlledStateEventLookup,
> {
  stateId: string;
  propModel?: GridEventLookup[E]['params'];
  stateSelector:
    | OutputSelector<State, Args, GridControlledStateEventLookup[E]['params']>
    | ((state: State) => GridControlledStateEventLookup[E]['params']);
  propOnChange?: (
    model: GridControlledStateEventLookup[E]['params'],
    details: GridCallbackDetails,
  ) => void;
  changeEvent: E;
}
