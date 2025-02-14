import { RefObject } from '@mui/x-internals/types';
import { useGridInitialization } from '../hooks/core/useGridInitialization';
import { useGridAggregationPreProcessors } from '../hooks/features/aggregation/useGridAggregation';
import { useGridClipboard } from '../hooks/features/clipboard/useGridClipboard';
import {
  columnGroupsStateInitializer,
  useGridColumnGrouping,
} from '../hooks/features/columnGrouping/useGridColumnGrouping';
import {
  columnMenuStateInitializer,
  useGridColumnMenu,
} from '../hooks/features/columnMenu/useGridColumnMenu';
import {
  columnPinningStateInitializer,
  useGridColumnPinning,
} from '../hooks/features/columnPinning/useGridColumnPinning';
import {
  columnResizeStateInitializer,
  useGridColumnResize,
} from '../hooks/features/columnResize/useGridColumnResize';
import { columnsStateInitializer, useGridColumns } from '../hooks/features/columns/useGridColumns';
import { useGridColumnSpanning } from '../hooks/features/columns/useGridColumnSpanning';
import { densityStateInitializer, useGridDensity } from '../hooks/features/density/useGridDensity';
import {
  detailPanelStateInitializer,
  useGridDetailPanel,
} from '../hooks/features/detailPanel/useGridDetailPanel';
import {
  dimensionsStateInitializer,
  useGridDimensions,
} from '../hooks/features/dimensions/useGridDimensions';
import { editingStateInitializer, useGridEditing } from '../hooks/features/editing/useGridEditing';
import { useGridEvents } from '../hooks/features/events/useGridEvents';
import { useGridCsvExport } from '../hooks/features/export/useGridCsvExport';
import { useGridPrintExport } from '../hooks/features/export/useGridPrintExport';
import { filterStateInitializer, useGridFilter } from '../hooks/features/filter/useGridFilter';
import { focusStateInitializer, useGridFocus } from '../hooks/features/focus/useGridFocus';
import { useGridKeyboardNavigation } from '../hooks/features/keyboardNavigation/useGridKeyboardNavigation';
import {
  listViewStateInitializer,
  useGridListView,
} from '../hooks/features/listView/useGridListView';
import {
  paginationStateInitializer,
  useGridPagination,
} from '../hooks/features/pagination/useGridPagination';
import {
  preferencePanelStateInitializer,
  useGridPreferencesPanel,
} from '../hooks/features/preferencesPanel/useGridPreferencesPanel';
import {
  rowGroupingStateInitializer,
  useGridRowGrouping,
  useGridRowGroupingPreProcessors,
} from '../hooks/features/rowGrouping/useGridRowGrouping';
import {
  rowPinningStateInitializer,
  useGridRowPinning,
} from '../hooks/features/rowPinning/useGridRowPinning';
import { useGridParamsApi } from '../hooks/features/rows/useGridParamsApi';
import { rowsStateInitializer, useGridRows } from '../hooks/features/rows/useGridRows';
import { rowsMetaStateInitializer, useGridRowsMeta } from '../hooks/features/rows/useGridRowsMeta';
import {
  rowSpanningStateInitializer,
  useGridRowSpanning,
} from '../hooks/features/rows/useGridRowSpanning';
import { useGridRowsPreProcessors } from '../hooks/features/rows/useGridRowsPreProcessors';
import {
  rowSelectionStateInitializer,
  useGridRowSelection,
} from '../hooks/features/rowSelection/useGridRowSelection';
import { useGridRowSelectionPreProcessors } from '../hooks/features/rowSelection/useGridRowSelectionPreProcessors';
import { useGridScroll } from '../hooks/features/scroll/useGridScroll';
import { sortingStateInitializer, useGridSorting } from '../hooks/features/sorting/useGridSorting';
import { useGridStatePersistence } from '../hooks/features/statePersistence/useGridStatePersistence';
import {
  useGridVirtualization,
  virtualizationStateInitializer,
} from '../hooks/features/virtualization';
import { useGridInitializeState } from '../hooks/utils/useGridInitializeState';
import { GridApiCommunity, GridPrivateApiCommunity } from '../models/api/gridApiCommunity';
import { DataGridProcessedProps } from '../models/props/DataGridProps';

export const useDataGridComponent = (
  inputApiRef: RefObject<GridApiCommunity | null> | undefined,
  props: DataGridProcessedProps,
) => {
  const apiRef = useGridInitialization<GridPrivateApiCommunity, GridApiCommunity>(
    inputApiRef,
    props,
  );

  /**
   * Register all pre-processors called during state initialization here.
   */
  useGridRowsPreProcessors(apiRef);
  useGridRowGroupingPreProcessors(apiRef, props);
  useGridRowSelectionPreProcessors(apiRef, props);
  useGridAggregationPreProcessors(apiRef, props);

  // TO-DO SEPARATE COLUMN PINNING AND ROW PINNING PREPROCESSORS HERe

  /**
   * Register all state initializers here.
   */
  useGridInitializeState(rowGroupingStateInitializer, apiRef, props);
  useGridInitializeState(rowSelectionStateInitializer, apiRef, props);
  useGridInitializeState(columnsStateInitializer, apiRef, props);
  useGridInitializeState(detailPanelStateInitializer, apiRef, props);
  useGridInitializeState(columnPinningStateInitializer, apiRef, props);
  useGridInitializeState(rowsStateInitializer, apiRef, props);
  useGridInitializeState(paginationStateInitializer, apiRef, props);
  useGridInitializeState(editingStateInitializer, apiRef, props);
  useGridInitializeState(focusStateInitializer, apiRef, props);
  useGridInitializeState(sortingStateInitializer, apiRef, props);
  useGridInitializeState(preferencePanelStateInitializer, apiRef, props);
  useGridInitializeState(filterStateInitializer, apiRef, props);
  useGridInitializeState(rowSpanningStateInitializer, apiRef, props);
  useGridInitializeState(densityStateInitializer, apiRef, props);
  useGridInitializeState(columnResizeStateInitializer, apiRef, props);
  useGridInitializeState(columnMenuStateInitializer, apiRef, props);
  useGridInitializeState(columnGroupsStateInitializer, apiRef, props);
  useGridInitializeState(virtualizationStateInitializer, apiRef, props);
  useGridInitializeState(dimensionsStateInitializer, apiRef, props);
  useGridInitializeState(rowPinningStateInitializer, apiRef, props);
  useGridInitializeState(rowsMetaStateInitializer, apiRef, props);
  useGridInitializeState(listViewStateInitializer, apiRef, props);

  useGridRowGrouping(apiRef, props);
  useGridKeyboardNavigation(apiRef, props);
  useGridRowSelection(apiRef, props);
  useGridColumns(apiRef, props);
  useGridRows(apiRef, props);
  useGridRowSpanning(apiRef, props);
  useGridParamsApi(apiRef, props);
  useGridDetailPanel(apiRef, props);
  useGridColumnPinning(apiRef, props);
  useGridColumnSpanning(apiRef);
  useGridColumnGrouping(apiRef, props);
  useGridEditing(apiRef, props);
  useGridFocus(apiRef, props);
  useGridPreferencesPanel(apiRef, props);
  useGridFilter(apiRef, props);
  useGridRowPinning(apiRef, props);
  useGridSorting(apiRef, props);
  useGridDensity(apiRef, props);
  useGridColumnResize(apiRef, props);
  useGridPagination(apiRef, props);
  useGridRowsMeta(apiRef, props);
  useGridScroll(apiRef, props);
  useGridColumnMenu(apiRef);
  useGridCsvExport(apiRef, props);
  useGridPrintExport(apiRef, props);
  useGridClipboard(apiRef, props);
  useGridDimensions(apiRef, props);
  useGridEvents(apiRef, props);
  useGridStatePersistence(apiRef);
  useGridVirtualization(apiRef, props);
  useGridListView(apiRef, props);

  return apiRef;
};
