import type {
  GridPipeProcessingApi,
  GridPipeProcessingPrivateApi,
} from '../../hooks/core/pipeProcessing';
import type { GridStrategyProcessingApi } from '../../hooks/core/strategyProcessing';
import { GridAggregationApi, GridAggregationPrivateApi } from '../../hooks/features/aggregation';
import type { GridColumnPinningApi } from '../../hooks/features/columnPinning';
import type { GridColumnResizeApi } from '../../hooks/features/columnResize';
import { GridDetailPanelApi, GridDetailPanelPrivateApi } from '../../hooks/features/detailPanel';
import type {
  GridDimensionsApi,
  GridDimensionsPrivateApi,
} from '../../hooks/features/dimensions/gridDimensionsApi';
import type { GridPaginationApi } from '../../hooks/features/pagination';
import { GridRowGroupingApi } from '../../hooks/features/rowGrouping';
import { GridRowPinningApi } from '../../hooks/features/rowPinning/rowPinningInterfaces';
import type { GridStatePersistenceApi } from '../../hooks/features/statePersistence';
import type { GridInitialStateCommunity, GridStateCommunity } from '../gridStateCommunity';
import type { DataGridProcessedProps } from '../props/DataGridProps';
import { GridColumnApi } from './gridColumnApi';
import { GridColumnGroupingApi } from './gridColumnGroupingApi';
import { GridColumnMenuApi } from './gridColumnMenuApi';
import { GridColumnSpanningApi, GridColumnSpanningPrivateApi } from './gridColumnSpanning';
import { GridCoreApi, GridCorePrivateApi } from './gridCoreApi';
import { GridCsvExportApi } from './gridCsvExportApi';
import { GridDensityApi } from './gridDensityApi';
import { GridEditingApi, GridEditingPrivateApi } from './gridEditingApi';
import type { GridFilterApi } from './gridFilterApi';
import { GridFocusApi, GridFocusPrivateApi } from './gridFocusApi';
import { GridHeaderFilteringApi, GridHeaderFilteringPrivateApi } from './gridHeaderFilteringApi';
import type { GridLocaleTextApi } from './gridLocaleTextApi';
import { GridLoggerApi } from './gridLoggerApi';
import type { GridParamsApi, GridParamsPrivateApi } from './gridParamsApi';
import { GridPreferencesPanelApi } from './gridPreferencesPanelApi';
import { GridPrintExportApi } from './gridPrintExportApi';
import { GridRowApi, GridRowProPrivateApi } from './gridRowApi';
import { GridRowSelectionApi } from './gridRowSelectionApi';
import { GridRowsMetaApi, GridRowsMetaPrivateApi } from './gridRowsMetaApi';
import { GridScrollApi } from './gridScrollApi';
import { GridSortApi } from './gridSortApi';
import { GridStateApi, GridStatePrivateApi } from './gridStateApi';
import { GridVirtualizationApi, GridVirtualizationPrivateApi } from './gridVirtualizationApi';

export interface GridApiCommon<
  GridState extends GridStateCommunity = any,
  GridInitialState extends GridInitialStateCommunity = any,
> extends GridCoreApi,
    GridPipeProcessingApi,
    GridDensityApi,
    GridDimensionsApi,
    GridRowApi,
    GridRowsMetaApi,
    GridEditingApi,
    GridParamsApi,
    GridColumnApi,
    GridColumnPinningApi,
    GridRowSelectionApi,
    GridSortApi,
    GridPaginationApi,
    GridCsvExportApi,
    GridFocusApi,
    GridFilterApi,
    GridColumnMenuApi,
    GridPreferencesPanelApi,
    GridPrintExportApi,
    GridVirtualizationApi,
    GridLocaleTextApi,
    GridScrollApi,
    GridColumnSpanningApi,
    GridStateApi<GridState>,
    GridStatePersistenceApi<GridInitialState>,
    GridColumnGroupingApi,
    GridHeaderFilteringApi,
    GridColumnResizeApi,
    GridRowPinningApi,
    GridDetailPanelApi,
    GridRowGroupingApi,
    GridAggregationApi {}

export interface GridPrivateOnlyApiCommon<
  Api extends GridApiCommon,
  PrivateApi extends GridPrivateApiCommon,
  Props extends DataGridProcessedProps,
> extends GridCorePrivateApi<Api, PrivateApi, Props>,
    GridStatePrivateApi<PrivateApi['state']>,
    GridPipeProcessingPrivateApi,
    GridStrategyProcessingApi,
    GridColumnSpanningPrivateApi,
    GridRowsMetaPrivateApi,
    GridDimensionsPrivateApi,
    GridEditingPrivateApi,
    GridLoggerApi,
    GridFocusPrivateApi,
    GridHeaderFilteringPrivateApi,
    GridVirtualizationPrivateApi,
    GridRowProPrivateApi,
    GridParamsPrivateApi,
    GridDetailPanelPrivateApi,
    GridAggregationPrivateApi {}

export interface GridPrivateApiCommon
  extends GridApiCommon,
    GridPrivateOnlyApiCommon<GridApiCommon, GridPrivateApiCommon, DataGridProcessedProps> {}
