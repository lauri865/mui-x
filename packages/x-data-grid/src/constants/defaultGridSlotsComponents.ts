import {
  GridColumnHeaderFilterIconButton,
  GridColumnHeaderSortIcon,
  GridColumnsManagement,
  GridColumnsPanel,
  GridFilterPanel,
  GridFooter,
  GridLoadingOverlay,
  GridNoRowsOverlay,
  GridPagination,
  GridRow,
  GridRowCount,
  GridSkeletonCell,
} from '../components';
import { GridCell } from '../components/cell/GridCell';
import { GridColumnHeaders } from '../components/GridColumnHeaders';
import { GridNoColumnsOverlay } from '../components/GridNoColumnsOverlay';
import { GridNoResultsOverlay } from '../components/GridNoResultsOverlay';
import { GridPinnedRows } from '../components/GridPinnedRows';
import { GridColumnMenu } from '../components/menu/columnMenu/GridColumnMenu';
import { GridSlotsComponent } from '../models';
import materialSlots from '../slots';

// TODO: camelCase these key. It's a private helper now.
// Remove then need to call `uncapitalizeObjectKeys`.
export const DATA_GRID_DEFAULT_SLOTS_COMPONENTS: GridSlotsComponent = {
  ...materialSlots,
  cell: GridCell,
  skeletonCell: GridSkeletonCell,
  columnHeaderFilterIconButton: GridColumnHeaderFilterIconButton,
  columnHeaderSortIcon: GridColumnHeaderSortIcon,
  columnMenu: GridColumnMenu,
  columnHeaders: GridColumnHeaders,
  footer: GridFooter,
  footerRowCount: GridRowCount,
  toolbar: null,
  pinnedRows: GridPinnedRows,
  loadingOverlay: GridLoadingOverlay,
  noResultsOverlay: GridNoResultsOverlay,
  noRowsOverlay: GridNoRowsOverlay,
  noColumnsOverlay: GridNoColumnsOverlay,
  pagination: GridPagination,
  filterPanel: GridFilterPanel,
  columnsPanel: GridColumnsPanel,
  columnsManagement: GridColumnsManagement,
  row: GridRow,
};
