import type { GridInitialStateCommunity, GridStateCommunity } from '../gridStateCommunity';
import type { DataGridProcessedProps } from '../props/DataGridProps';
import type { GridApiCommon, GridPrivateOnlyApiCommon } from './gridApiCommon';
import type { GridColumnReorderApi, GridColumnReorderApiInternal } from './gridColumnApi';
import { GridRowProApi } from './gridRowApi';
import { GridRowMultiSelectionApi } from './gridRowSelectionApi';

/**
 * The api of Data Grid.
 */
export interface GridApiCommunity
  extends GridApiCommon<GridStateCommunity, GridInitialStateCommunity>,
    GridColumnReorderApi,
    GridRowMultiSelectionApi,
    GridRowProApi {}

export interface GridPrivateApiCommunity
  extends Omit<GridApiCommunity, 'setColumnIndex'>,
    GridPrivateOnlyApiCommon<GridApiCommunity, GridPrivateApiCommunity, DataGridProcessedProps>,
    GridColumnReorderApiInternal {}
