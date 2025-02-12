import type {
  GridColumnIdentifier,
  GridColumnMenuState,
  GridColumnPinningState,
  GridColumnsGroupingState,
  GridColumnsInitialState,
  GridColumnsState,
  GridDensityState,
  GridDimensionsState,
  GridFilterInitialState,
  GridFilterState,
  GridFocusState,
  GridPaginationInitialState,
  GridPaginationState,
  GridPreferencePanelInitialState,
  GridPreferencePanelState,
  GridRowsState,
  GridSortingInitialState,
  GridSortingState,
  GridTabIndexState,
  GridVirtualizationState,
} from '../hooks';
import type { GridColumnResizeState } from '../hooks/features/columnResize';
import { GridPinnedColumnFields } from '../hooks/features/columns/gridColumnsInterfaces';
import { GridDetailPanelInitialState, GridDetailPanelState } from '../hooks/features/detailPanel';
import type { GridVisibleRowsLookupState } from '../hooks/features/filter/gridFilterState';
import type { GridListViewState } from '../hooks/features/listView/useGridListView';
import { GridRowGroupingInitialState, GridRowGroupingState } from '../hooks/features/rowGrouping';
import {
  GridPinnedRowsModel,
  GridPinnedRowsState,
} from '../hooks/features/rowPinning/rowPinningInterfaces';
import type { GridRowsMetaState } from '../hooks/features/rows/gridRowsMetaState';
import type { GridRowSpanningState } from '../hooks/features/rows/useGridRowSpanning';
import { GridCellCoordinates } from '../models/gridCell';
import type { GridEditingState } from './gridEditRowModel';
import { GridHeaderFilteringState } from './gridHeaderFilteringModel';
import type { GridRowSelectionModel } from './gridRowSelectionModel';

/**
 * The state of Data Grid.
 */
export interface GridStateCommunity {
  isRtl: boolean;
  dimensions: GridDimensionsState;
  rows: GridRowsState;
  visibleRowsLookup: GridVisibleRowsLookupState;
  rowsMeta: GridRowsMetaState;
  editRows: GridEditingState;
  headerFiltering: GridHeaderFilteringState;
  pagination: GridPaginationState;
  columns: GridColumnsState;
  columnGrouping: GridColumnsGroupingState;
  columnMenu: GridColumnMenuState;
  pinnedColumns: GridColumnPinningState;
  sorting: GridSortingState;
  focus: GridFocusState;
  tabIndex: GridTabIndexState;
  rowSelection: GridRowSelectionModel;
  filter: GridFilterState;
  preferencePanel: GridPreferencePanelState;
  density: GridDensityState;
  virtualization: GridVirtualizationState;
  columnResize: GridColumnResizeState;
  rowSpanning: GridRowSpanningState;
  listViewColumn: GridListViewState;
  pinnedRows: GridPinnedRowsState;
  rowGrouping: GridRowGroupingState;
  detailPanel: GridDetailPanelState;
}

/**
 * The initial state of Data Grid.
 */
export interface GridInitialStateCommunity {
  pagination?: GridPaginationInitialState;
  sorting?: GridSortingInitialState;
  filter?: GridFilterInitialState;
  columns?: GridColumnsInitialState;
  preferencePanel?: GridPreferencePanelInitialState;
  density?: GridDensityState;
  scroll?: { top: number; left: number };
  pinnedColumns?: GridPinnedColumnFields;
  pinnedRows?: GridPinnedRowsModel;
  focus?: {
    cell?: GridCellCoordinates;
    columnHeader?: GridColumnIdentifier;
  };
  detailPanel?: GridDetailPanelInitialState;
  rowGrouping?: GridRowGroupingInitialState;
  rowSelection?: GridRowSelectionModel;
}
