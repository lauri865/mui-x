import { RefObject } from '@mui/x-internals/types';
import * as React from 'react';
import type { GridPrivateApi } from '../../../models/api/gridApiCommunity';
import { GridRowId } from '../../../models/gridRows';
import type { DataGridProcessedProps } from '../../../models/props/DataGridProps';
import { useGridApiMethod } from '../../utils/useGridApiMethod';
import { GridStateInitializer } from '../../utils/useGridInitializeState';
import { GRID_ROOT_FOOTER_ID } from '../aggregation/useGridAggregation';
import { gridRowTreeSelector } from '../rows';
import { gridPinnedRowsModelSelector } from './gridRowPinningSelector';
import {
  EMPTY_PINNED_ROWS,
  GridPinnedRowPosition,
  GridPinnedRowsModel,
  GridRowPinningApi,
} from './rowPinningInterfaces';

export const rowPinningStateInitializer: GridStateInitializer<
  Pick<DataGridProcessedProps, 'pinnedRows' | 'initialState'>
> = (state, props, apiRef) => {
  let model = props.pinnedRows ?? props.initialState?.pinnedRows ?? EMPTY_PINNED_ROWS;

  const tree = gridRowTreeSelector(apiRef.current.state);
  const hasFooter = tree[GRID_ROOT_FOOTER_ID] != null;

  if (hasFooter) {
    model = {
      ...model,
      bottom: [...model.bottom, GRID_ROOT_FOOTER_ID],
    };
  }
  return {
    ...state,
    pinnedRows: model,
  };
};

export const useGridRowPinning = (
  apiRef: RefObject<GridPrivateApi>,
  props: Pick<DataGridProcessedProps, 'pinnedRows'>,
) => {
  const pinRow = React.useCallback(
    (id: GridRowId, position: GridPinnedRowPosition) => {
      const model = gridPinnedRowsModelSelector(apiRef.current.state);
      const pinnedPosition = apiRef.current.getRowPinnedPosition(id);
      if (pinnedPosition === position) {
        return;
      }

      const newModel = {
        ...model,
        [position]:
          position === GridPinnedRowPosition.top
            ? [...model[position], id]
            : [id, ...model[position]],
      };

      if (pinnedPosition) {
        newModel[pinnedPosition] = model[pinnedPosition].filter((rowId) => rowId !== id);
      }

      apiRef.current.state.visibleRowsLookup[id] = false;
      apiRef.current.setPinnedRows(newModel);
    },
    [apiRef],
  );

  const unpinRow = React.useCallback(
    (id: GridRowId) => {
      const position = apiRef.current.getRowPinnedPosition(id);
      if (!position) {
        return;
      }
      const model = gridPinnedRowsModelSelector(apiRef.current.state);
      const newModel = {
        ...model,
        [position]: model[position].filter((rowId) => rowId !== id),
      };

      delete apiRef.current.state.visibleRowsLookup[id];
      apiRef.current.setPinnedRows(newModel);
    },
    [apiRef],
  );

  const unpinAllRows = React.useCallback(() => {
    apiRef.current.setPinnedRows(EMPTY_PINNED_ROWS);
  }, [apiRef]);

  const isRowPinned = React.useCallback(
    (id: GridRowId) => {
      const position = apiRef.current.getRowPinnedPosition(id);
      return position !== null;
    },
    [apiRef],
  );

  const getRowPinnedPosition = React.useCallback(
    (id: GridRowId) => {
      const model = gridPinnedRowsModelSelector(apiRef.current.state);
      if (model === EMPTY_PINNED_ROWS) {
        return null;
      }
      if (model.top.includes(id)) {
        return GridPinnedRowPosition.top;
      }
      if (model.bottom.includes(id)) {
        return GridPinnedRowPosition.bottom;
      }
      return null;
    },
    [apiRef],
  );

  const getPinnedRows = React.useCallback(
    () => gridPinnedRowsModelSelector(apiRef.current.state),
    [apiRef],
  );

  const setPinnedRows = React.useCallback(
    (pinnedRows: GridPinnedRowsModel) => {
      const currentModel = gridPinnedRowsModelSelector(apiRef.current.state);
      if (currentModel === pinnedRows) {
        return;
      }
      apiRef.current.setState((state) => ({
        ...state,
        pinnedRows,
      }));
    },
    [apiRef],
  );

  const methods: GridRowPinningApi = {
    pinRow,
    unpinRow,
    unpinAllRows,
    isRowPinned,
    getRowPinnedPosition,
    getPinnedRows,
    setPinnedRows,
  };

  useGridApiMethod(apiRef, methods, 'public');

  /*  const overrideVisibleRowsLookup = React.useCallback(() => {
    const model = gridPinnedRowsModelSelector(apiRef.current.state);
    if (model === EMPTY_PINNED_ROWS) {
      return;
    }

    const pinnnedRowIds = [...model.top, ...model.bottom];
    const visibleRowsLookup = { ...apiRef.current.state.visibleRowsLookup };

    for (let i = 0; i < pinnnedRowIds.length; i += 1) {
      const rowId = pinnnedRowIds[i];
      visibleRowsLookup[rowId] = false;
    }

    // HACK: update filtered rows selector instead
    apiRef.current.state.visibleRowsLookup = visibleRowsLookup;
  }, [apiRef]);

  useGridApiOptionHandler(apiRef, 'filteredRowsSet', overrideVisibleRowsLookup);
  useGridApiOptionHandler(apiRef, 'sortedRowsSet', overrideVisibleRowsLookup); */

  React.useEffect(() => {
    if (props.pinnedRows) {
      apiRef.current.setPinnedRows(props.pinnedRows);
    }
  }, [apiRef, props.pinnedRows]);
};
