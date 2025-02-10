import {
  columnGroupsStateInitializer,
  columnMenuStateInitializer,
  columnPinningStateInitializer,
  columnResizeStateInitializer,
  columnsStateInitializer,
  densityStateInitializer,
  dimensionsStateInitializer,
  editingStateInitializer,
  filterStateInitializer,
  focusStateInitializer,
  headerFilteringStateInitializer,
  listViewStateInitializer,
  paginationStateInitializer,
  preferencePanelStateInitializer,
  rowSelectionStateInitializer,
  rowsMetaStateInitializer,
  rowSpanningStateInitializer,
  rowsStateInitializer,
  sortingStateInitializer,
  useGridClipboard,
  useGridColumnGrouping,
  useGridColumnMenu,
  useGridColumnPinning,
  useGridColumnResize,
  useGridColumns,
  useGridColumnSpanning,
  useGridCsvExport,
  useGridDensity,
  useGridDimensions,
  useGridEditing,
  useGridEvents,
  useGridFilter,
  useGridFocus,
  useGridHeaderFiltering,
  useGridInitialization,
  useGridInitializeState,
  useGridKeyboardNavigation,
  useGridListView,
  useGridPagination,
  useGridParamsApi,
  useGridPreferencesPanel,
  useGridPrintExport,
  useGridRows,
  useGridRowSelection,
  useGridRowSelectionPreProcessors,
  useGridRowsMeta,
  useGridRowSpanning,
  useGridRowsPreProcessors,
  useGridScroll,
  useGridSorting,
  useGridStatePersistence,
  useGridVirtualization,
  virtualizationStateInitializer,
} from '@mui/x-data-grid/internals';
import { RefObject } from '@mui/x-internals/types';
import { DataGridProProcessedProps } from '../models/dataGridProProps';
import { GridApiPro, GridPrivateApiPro } from '../models/gridApiPro';
// Pro-only features
import {
  columnReorderStateInitializer,
  useGridColumnReorder,
} from '../hooks/features/columnReorder/useGridColumnReorder';
import { dataSourceStateInitializer } from '../hooks/features/dataSource/useGridDataSourceBase';
import { useGridDataSourcePro as useGridDataSource } from '../hooks/features/dataSource/useGridDataSourcePro';
import {
  detailPanelStateInitializer,
  useGridDetailPanel,
} from '../hooks/features/detailPanel/useGridDetailPanel';
import { useGridDetailPanelPreProcessors } from '../hooks/features/detailPanel/useGridDetailPanelPreProcessors';
import { useGridInfiniteLoader } from '../hooks/features/infiniteLoader/useGridInfiniteLoader';
import { useGridLazyLoader } from '../hooks/features/lazyLoader/useGridLazyLoader';
import { useGridLazyLoaderPreProcessors } from '../hooks/features/lazyLoader/useGridLazyLoaderPreProcessors';
import {
  rowPinningStateInitializer,
  useGridRowPinning,
} from '../hooks/features/rowPinning/useGridRowPinning';
import { useGridRowPinningPreProcessors } from '../hooks/features/rowPinning/useGridRowPinningPreProcessors';
import { useGridRowReorder } from '../hooks/features/rowReorder/useGridRowReorder';
import { useGridRowReorderPreProcessors } from '../hooks/features/rowReorder/useGridRowReorderPreProcessors';
import { useGridDataSourceLazyLoader } from '../hooks/features/serverSideLazyLoader/useGridDataSourceLazyLoader';
import { useGridDataSourceTreeDataPreProcessors } from '../hooks/features/serverSideTreeData/useGridDataSourceTreeDataPreProcessors';
import { useGridTreeData } from '../hooks/features/treeData/useGridTreeData';
import { useGridTreeDataPreProcessors } from '../hooks/features/treeData/useGridTreeDataPreProcessors';

export const useDataGridProComponent = (
  inputApiRef: RefObject<GridApiPro | null> | undefined,
  props: DataGridProProcessedProps,
) => {
  const apiRef = useGridInitialization<GridPrivateApiPro, GridApiPro>(inputApiRef, props);

  /**
   * Register all pre-processors called during state initialization here.
   */
  useGridRowSelectionPreProcessors(apiRef, props);
  useGridRowReorderPreProcessors(apiRef, props);
  useGridTreeDataPreProcessors(apiRef, props);
  useGridDataSourceTreeDataPreProcessors(apiRef, props);
  useGridLazyLoaderPreProcessors(apiRef, props);
  useGridRowPinningPreProcessors(apiRef);
  useGridDetailPanelPreProcessors(apiRef, props);
  // The column pinning `hydrateColumns` pre-processor must be after every other `hydrateColumns` pre-processors
  // Because it changes the order of the columns.
  // useGridColumnPinningPreProcessors(apiRef, props);
  useGridRowsPreProcessors(apiRef);

  /**
   * Register all state initializers here.
   */
  useGridInitializeState(headerFilteringStateInitializer, apiRef, props);
  useGridInitializeState(rowSelectionStateInitializer, apiRef, props);
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

  useGridHeaderFiltering(apiRef, props);
  useGridTreeData(apiRef, props);
  useGridKeyboardNavigation(apiRef, props);
  useGridRowSelection(apiRef, props);
  useGridRowPinning(apiRef, props);
  useGridColumns(apiRef, props);
  useGridColumnPinning(apiRef, props);
  useGridRows(apiRef, props);
  useGridRowSpanning(apiRef, props);
  useGridParamsApi(apiRef, props);
  useGridDetailPanel(apiRef, props);
  useGridColumnSpanning(apiRef);
  useGridColumnGrouping(apiRef, props);
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
  useGridClipboard(apiRef, props);
  useGridDimensions(apiRef, props);
  useGridEvents(apiRef, props);
  useGridStatePersistence(apiRef);
  useGridVirtualization(apiRef, props);
  useGridDataSource(apiRef, props);
  useGridListView(apiRef, props);

  return apiRef;
};
