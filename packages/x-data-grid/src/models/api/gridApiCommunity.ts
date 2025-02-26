import type { GridInitialState, GridState } from '../gridStateCommunity';
import type { DataGridProcessedProps } from '../props/DataGridProps';
import type { GridApiCommon, GridPrivateOnlyApiCommon } from './gridApiCommon';
import type { GridColumnReorderApi, GridColumnReorderApiInternal } from './gridColumnApi';
import { GridRowProApi } from './gridRowApi';
import { GridRowMultiSelectionApi } from './gridRowSelectionApi';

/**
 * The api of Data Grid.
 */
export interface GridApi
  extends GridApiCommon<GridState, GridInitialState>,
    GridColumnReorderApi,
    GridRowMultiSelectionApi,
    GridRowProApi {}

export interface GridPrivateApi
  extends Omit<GridApi, 'setColumnIndex'>,
    GridPrivateOnlyApiCommon<GridApi, GridPrivateApi, DataGridProcessedProps>,
    GridColumnReorderApiInternal {}
