import * as React from 'react';
import { RefObject } from '@mui/x-internals/types';
import { useGridApiMethod } from '../../utils/useGridApiMethod';
import type { GridPrivateApiCommunity } from '../../../models/api/gridApiCommunity';
import type { DataGridProcessedProps } from '../../../models/props/DataGridProps';
import { GridStateInitializer } from '../../utils/useGridInitializeState';
import {
  EMPTY_EXPANDED_DETAIL_PANELS,
  GridDetailPanelApi,
  GridDetailPanelPrivateApi,
} from './gridDetailPanelInterface';
import { GridRowId } from '../../../models/gridRows';
import { GridPipeProcessor, useGridRegisterPipeProcessor } from '../../core/pipeProcessing';
import { gridDetailPanelExpandedRowIdsSelector } from './gridDetailPanelSelector';
import {
  GRID_DETAIL_PANEL_TOGGLE_FIELD,
  GRID_DETAIL_PANEL_COL_DEF,
} from '../../../colDef/gridDetailPanelColDef';

export const detailPanelStateInitializer: GridStateInitializer<
  Pick<DataGridProcessedProps, 'detailPanelExpandedRowIds' | 'initialState'>
> = (state, props, apiRef) => {
  const expandedRowIds =
    props.detailPanelExpandedRowIds ??
    props.initialState?.detailPanel?.expandedRowIds ??
    EMPTY_EXPANDED_DETAIL_PANELS;
  apiRef.current.caches.detailPanel = { expandingRowIds: new Set() };
  return {
    ...state,
    detailPanel: {
      ...state.detailPanel,
      expandedRowIds,
      expandingRowIds: new Set(),
    },
  };
};

export const useGridDetailPanel = (
  apiRef: RefObject<GridPrivateApiCommunity>,
  props: Pick<DataGridProcessedProps, 'detailPanelExpandedRowIds' | 'getDetailPanelContent'>,
) => {
  const heights = React.useRef(new Map<GridRowId, number>());
  const toggleDetailPanel = React.useCallback<GridDetailPanelApi['toggleDetailPanel']>(
    (id) => {
      const expandedRowIds = gridDetailPanelExpandedRowIdsSelector(apiRef.current.state);
      const newExpandedRowIds = new Set(expandedRowIds);

      if (newExpandedRowIds.has(id)) {
        newExpandedRowIds.delete(id);
        apiRef.current.caches.detailPanel.expandingRowIds.delete(id);
      } else {
        newExpandedRowIds.add(id);
        apiRef.current.caches.detailPanel.expandingRowIds.add(id);
      }

      apiRef.current.setExpandedDetailPanels(newExpandedRowIds);
    },
    [apiRef],
  );

  const isDetailPanelExpanded = React.useCallback<GridDetailPanelApi['isDetailPanelExpanded']>(
    (id) => {
      const expandedRowIds = gridDetailPanelExpandedRowIdsSelector(apiRef.current.state);
      return expandedRowIds.has(id);
    },
    [apiRef],
  );

  const getExpandedDetailPanels = React.useCallback<
    GridDetailPanelApi['getExpandedDetailPanels']
  >(() => {
    return gridDetailPanelExpandedRowIdsSelector(apiRef.current.state);
  }, [apiRef]);

  const setExpandedDetailPanels = React.useCallback<GridDetailPanelApi['setExpandedDetailPanels']>(
    (expandedRowIds) => {
      console.log('set');
      apiRef.current.setState((state) => ({
        ...state,
        detailPanel: {
          ...state.detailPanel,
          expandedRowIds,
        },
      }));
      apiRef.current.requestPipeProcessorsApplication('hydrateRows');
    },
    [apiRef],
  );

  const setDetailPanelHeight = React.useCallback<GridDetailPanelPrivateApi['setDetailPanelHeight']>(
    (id, height) => {
      const currentHeight = heights.current.get(id) ?? 0;
      if (currentHeight !== height) {
        heights.current.set(id, height);
      }

      const entry = apiRef.current.getRowHeightEntry(id);
      if (entry.detail === height) {
        return;
      }

      apiRef.current.requestPipeProcessorsApplication('rowHeight');
    },
    [apiRef],
  );

  const getDetailPanelHeight = React.useCallback<GridDetailPanelPrivateApi['getDetailPanelHeight']>(
    (id) => {
      return heights.current.get(id) ?? 0;
    },
    [],
  );

  const hydrateDetailPanelHeight = React.useCallback<GridPipeProcessor<'rowHeight'>>(
    (entry, row) => {
      const expandedRowIds = gridDetailPanelExpandedRowIdsSelector(apiRef.current.state);
      if (!expandedRowIds.has(row.id) || !heights.current.has(row.id)) {
        entry.detail = 0;
        return entry;
      }
      entry.detail = heights.current.get(row.id)!;
      return entry;
    },
    [apiRef, heights],
  );

  const isEnabled = props.getDetailPanelContent !== undefined;
  const addDetailPanelColumn = React.useCallback<GridPipeProcessor<'hydrateColumns'>>(
    (columns) => {
      const hasColumn = columns.lookup[GRID_DETAIL_PANEL_TOGGLE_FIELD];
      if (hasColumn) {
        if (!isEnabled) {
          delete columns.lookup[GRID_DETAIL_PANEL_TOGGLE_FIELD];
          delete columns.columnVisibilityModel[GRID_DETAIL_PANEL_TOGGLE_FIELD];
          columns.orderedFields = columns.orderedFields.filter(
            (field) => field !== GRID_DETAIL_PANEL_TOGGLE_FIELD,
          );
        }
        return columns;
      }

      columns.orderedFields.unshift(GRID_DETAIL_PANEL_TOGGLE_FIELD);
      columns.lookup[GRID_DETAIL_PANEL_TOGGLE_FIELD] = { ...GRID_DETAIL_PANEL_COL_DEF };

      return columns;
    },
    [isEnabled],
  );

  useGridRegisterPipeProcessor(apiRef, 'rowHeight', hydrateDetailPanelHeight, isEnabled);
  useGridRegisterPipeProcessor(apiRef, 'hydrateColumns', addDetailPanelColumn);

  useGridApiMethod(
    apiRef,
    {
      toggleDetailPanel,
      isDetailPanelExpanded,
      getExpandedDetailPanels,
      setExpandedDetailPanels,
    },
    'public',
  );

  useGridApiMethod(
    apiRef,
    {
      setDetailPanelHeight,
      getDetailPanelHeight,
    },
    'private',
  );

  React.useEffect(() => {
    if (props.detailPanelExpandedRowIds) {
      apiRef.current.setExpandedDetailPanels(props.detailPanelExpandedRowIds);
    }
  }, [apiRef, props.detailPanelExpandedRowIds]);
};
