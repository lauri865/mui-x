import {
  columnGroupsStateInitializer,
  columnMenuStateInitializer,
  columnPinningStateInitializer,
  columnReorderStateInitializer,
  columnResizeStateInitializer,
  columnsStateInitializer,
  dataSourceStateInitializer,
  densityStateInitializer,
  detailPanelStateInitializer,
  dimensionsStateInitializer,
  editingStateInitializer,
  filterStateInitializer,
  focusStateInitializer,
  headerFilteringStateInitializer,
  listViewStateInitializer,
  paginationStateInitializer,
  preferencePanelStateInitializer,
  rowPinningStateInitializer,
  rowSelectionStateInitializer,
  rowsMetaStateInitializer,
  rowSpanningStateInitializer,
  rowsStateInitializer,
  sortingStateInitializer,
  useGridClipboard,
  useGridColumnGrouping,
  useGridColumnMenu,
  useGridColumnPinning,
  useGridColumnReorder,
  useGridColumnResize,
  useGridColumns,
  useGridColumnSpanning,
  useGridCsvExport,
  useGridDataSourceLazyLoader,
  useGridDataSourceTreeDataPreProcessors,
  useGridDensity,
  useGridDetailPanel,
  useGridDetailPanelPreProcessors,
  useGridDimensions,
  useGridEditing,
  useGridEvents,
  useGridFilter,
  useGridFocus,
  useGridHeaderFiltering,
  useGridInfiniteLoader,
  useGridInitialization,
  useGridInitializeState,
  useGridKeyboardNavigation,
  useGridLazyLoader,
  useGridLazyLoaderPreProcessors,
  useGridListView,
  useGridPagination,
  useGridParamsApi,
  useGridPreferencesPanel,
  useGridPrintExport,
  useGridRowPinning,
  useGridRowPinningPreProcessors,
  useGridRowReorder,
  useGridRowReorderPreProcessors,
  useGridRows,
  useGridRowSelection,
  useGridRowSelectionPreProcessors,
  useGridRowsMeta,
  useGridRowSpanning,
  useGridRowsPreProcessors,
  useGridScroll,
  useGridSorting,
  useGridStatePersistence,
  useGridTreeData,
  useGridTreeDataPreProcessors,
  useGridVirtualization,
  virtualizationStateInitializer,
} from '@mui/x-data-grid-pro/internals';
import { RefObject } from '@mui/x-internals/types';
import { useGridDataSourcePremium as useGridDataSource } from '../hooks/features/dataSource/useGridDataSourcePremium';
import { DataGridPremiumProcessedProps } from '../models/dataGridPremiumProps';
import { GridApiPremium, GridPrivateApiPremium } from '../models/gridApiPremium';
// Premium-only features
import {
  aggregationStateInitializer,
  useGridAggregation,
} from '../hooks/features/aggregation/useGridAggregation';
import { useGridAggregationPreProcessors } from '../hooks/features/aggregation/useGridAggregationPreProcessors';
import {
  cellSelectionStateInitializer,
  useGridCellSelection,
} from '../hooks/features/cellSelection/useGridCellSelection';
import { useGridClipboardImport } from '../hooks/features/clipboard/useGridClipboardImport';
import { useGridExcelExport } from '../hooks/features/export/useGridExcelExport';
import { useGridDataSourceRowGroupingPreProcessors } from '../hooks/features/rowGrouping/useGridDataSourceRowGroupingPreProcessors';
import {
  rowGroupingStateInitializer,
  useGridRowGrouping,
} from '../hooks/features/rowGrouping/useGridRowGrouping';
import { useGridRowGroupingPreProcessors } from '../hooks/features/rowGrouping/useGridRowGroupingPreProcessors';

export const useDataGridPremiumComponent = (
  inputApiRef: RefObject<GridApiPremium | null> | undefined,
  props: DataGridPremiumProcessedProps,
) => {
  const apiRef = useGridInitialization<GridPrivateApiPremium, GridApiPremium>(inputApiRef, props);

  /**
   * Register all pre-processors called during state initialization here.
   */
  useGridRowSelectionPreProcessors(apiRef, props);
  useGridRowReorderPreProcessors(apiRef, props);
  useGridRowGroupingPreProcessors(apiRef, props);
  useGridDataSourceRowGroupingPreProcessors(apiRef, props);
  useGridTreeDataPreProcessors(apiRef, props);
  useGridDataSourceTreeDataPreProcessors(apiRef, props);
  useGridLazyLoaderPreProcessors(apiRef, props);
  useGridRowPinningPreProcessors(apiRef);
  useGridAggregationPreProcessors(apiRef, props);
  useGridDetailPanelPreProcessors(apiRef, props);
  // The column pinning `hydrateColumns` pre-processor must be after every other `hydrateColumns` pre-processors
  // Because it changes the order of the columns.
  // useGridColumnPinningPreProcessors(apiRef, props);
  useGridRowsPreProcessors(apiRef);

  /**
   * Register all state initializers here.
   */
  useGridInitializeState(headerFilteringStateInitializer, apiRef, props);
  useGridInitializeState(rowGroupingStateInitializer, apiRef, props);
  useGridInitializeState(aggregationStateInitializer, apiRef, props);
  useGridInitializeState(rowSelectionStateInitializer, apiRef, props);
  useGridInitializeState(cellSelectionStateInitializer, apiRef, props);
  useGridInitializeState(detailPanelStateInitializer, apiRef, props);
  useGridInitializeState(columnsStateInitializer, apiRef, props);
  useGridInitializeState(columnPinningStateInitializer, apiRef, props);
  useGridInitializeState(rowPinningStateInitializer, apiRef, props);
  useGridInitializeState(paginationStateInitializer, apiRef, props);
  useGridInitializeState(rowsStateInitializer, apiRef, props);
  useGridInitializeState(editingStateInitializer, apiRef, props);
  useGridInitializeState(focusStateInitializer, apiRef, props);
  useGridInitializeState(sortingStateInitializer, apiRef, props);
  useGridInitializeState(preferencePanelStateInitializer, apiRef, props);
  useGridInitializeState(filterStateInitializer, apiRef, props);
  useGridInitializeState(rowSpanningStateInitializer, apiRef, props);
  useGridInitializeState(densityStateInitializer, apiRef, props);
  useGridInitializeState(columnReorderStateInitializer, apiRef, props);
  useGridInitializeState(columnResizeStateInitializer, apiRef, props);
  useGridInitializeState(columnMenuStateInitializer, apiRef, props);
  useGridInitializeState(columnGroupsStateInitializer, apiRef, props);
  useGridInitializeState(virtualizationStateInitializer, apiRef, props);
  useGridInitializeState(dataSourceStateInitializer, apiRef, props);
  useGridInitializeState(dimensionsStateInitializer, apiRef, props);
  useGridInitializeState(rowsMetaStateInitializer, apiRef, props);
  useGridInitializeState(listViewStateInitializer, apiRef, props);

  useGridRowGrouping(apiRef, props);
  useGridHeaderFiltering(apiRef, props);
  useGridTreeData(apiRef, props);
  useGridAggregation(apiRef, props);
  useGridDataSource(apiRef, props);
  useGridKeyboardNavigation(apiRef, props);
  useGridRowSelection(apiRef, props);
  useGridCellSelection(apiRef, props);
  useGridRowPinning(apiRef, props);
  useGridColumns(apiRef, props);
  useGridColumnPinning(apiRef, props);
  useGridRows(apiRef, props);
  useGridRowSpanning(apiRef, props);
  useGridParamsApi(apiRef, props);
  useGridDetailPanel(apiRef, props);
  useGridColumnSpanning(apiRef);
  useGridColumnGrouping(apiRef, props);
  useGridClipboardImport(apiRef, props);
  useGridEditing(apiRef, props);
  useGridFocus(apiRef, props);
  useGridPreferencesPanel(apiRef, props);
  useGridFilter(apiRef, props);
  useGridSorting(apiRef, props);
  useGridDensity(apiRef, props);
  useGridColumnReorder(apiRef, props);
  useGridColumnResize(apiRef, props);
  useGridPagination(apiRef, props);
  useGridRowsMeta(apiRef, props);
  useGridRowReorder(apiRef, props);
  useGridScroll(apiRef, props);
  useGridInfiniteLoader(apiRef, props);
  useGridLazyLoader(apiRef, props);
  useGridDataSourceLazyLoader(apiRef, props);
  useGridColumnMenu(apiRef);
  useGridCsvExport(apiRef, props);
  useGridPrintExport(apiRef, props);
  useGridExcelExport(apiRef, props);
  useGridClipboard(apiRef, props);
  useGridDimensions(apiRef, props);
  useGridEvents(apiRef, props);
  useGridStatePersistence(apiRef);
  useGridVirtualization(apiRef, props);
  useGridListView(apiRef, props);

  return apiRef;
};
