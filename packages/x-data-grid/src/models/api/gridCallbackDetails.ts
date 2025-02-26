import { GridControlledStateReasonLookup } from '../events/gridEventLookup';
import { GridApi } from './gridApiCommunity';

/**
 * Additional details passed to the callbacks
 */
export interface GridCallbackDetails<K extends keyof GridControlledStateReasonLookup = any> {
  /**
   * The reason for this callback to have been called.
   */
  reason?: GridControlledStateReasonLookup[K];
  /**
   * GridApi that let you manipulate the grid.
   */
  api: GridApi;
}
