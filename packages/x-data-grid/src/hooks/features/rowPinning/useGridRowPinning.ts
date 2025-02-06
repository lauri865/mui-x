import * as React from 'react';
import { RefObject } from '@mui/x-internals/types';
import type { GridPrivateApiCommunity } from '../../../models/api/gridApiCommunity';
import type { DataGridProcessedProps } from '../../../models/props/DataGridProps';
import { GridStateInitializer } from '../../utils/useGridInitializeState';
import { useGridApiMethod } from '../../utils/useGridApiMethod';
import { useGridRegisterPipeProcessor, GridPipeProcessor } from '../../core/pipeProcessing';
import {
  EMPTY_PINNED_ROWS,
  GridRowPinningApi,
  GridPinnedRowPosition,
  GridPinnedRowsModel,
} from './rowPinningInterfaces';
import { GridRowId } from '../../../models/gridRows';
import { gridpinnedRowsModelSelector } from './gridRowPinningSelectors';
import {
  GRID_DEFAULT_STRATEGY,
  GridStrategyProcessor,
  useGridRegisterStrategyProcessor,
} from '../../core/strategyProcessing';

export const rowPinningStateInitializer: GridStateInitializer<
  Pick<DataGridProcessedProps, 'pinnedRows' | 'initialState'>
> = (state, props, apiRef) => {
  const model = props.pinnedRows ?? props.initialState?.pinnedRows ?? EMPTY_PINNED_ROWS;
  return {
    ...state,
    pinnedRows: {
      model,
      visible: EMPTY_PINNED_ROWS,
    },
  };
};

export const useGridRowPinning = (
  apiRef: RefObject<GridPrivateApiCommunity>,
  props: Pick<DataGridProcessedProps, 'pinnedRows'>,
) => {
  const pinRow = React.useCallback(
    (id: GridRowId, position: GridPinnedRowPosition) => {
      const model = gridpinnedRowsModelSelector(apiRef.current.state);
      const pinnedPosition = apiRef.current.getRowPinnedPosition(id);
      if (pinnedPosition === position) {
        return;
      }
    },
    [apiRef],
  );

  const unpinRow = React.useCallback(
    (id: GridRowId) => {
      const position = apiRef.current.getRowPinnedPosition(id);
      if (!position) {
        return;
      }
      const model = gridpinnedRowsModelSelector(apiRef.current.state);
      const newModel = {
        ...model,
        [position]: model[position].filter((rowId) => rowId !== id),
      };
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
      const model = gridpinnedRowsModelSelector(apiRef.current.state);
      if (model === EMPTY_PINNED_ROWS) {
        return null;
      }
      if (model.top.includes(id)) {
        return GridPinnedRowPosition.top;
      } else if (model.bottom.includes(id)) {
        return GridPinnedRowPosition.bottom;
      }
      return null;
    },
    [apiRef],
  );

  const getPinnedRows = React.useCallback(
    () => gridpinnedRowsModelSelector(apiRef.current.state),
    [apiRef],
  );

  const setPinnedRows = React.useCallback(
    (pinnedRows: GridPinnedRowsModel) => {
      const currentModel = gridpinnedRowsModelSelector(apiRef.current.state);
      if (currentModel === pinnedRows) {
        return;
      }
      apiRef.current.setState((state) => ({
        ...state,
        pinnedRows: {
          ...state.pinnedRows,
          model: pinnedRows,
        },
      }));
      apiRef.current.requestPipeProcessorsApplication('hydrateRows');
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

  const hydratePinnedRows = React.useCallback<GridPipeProcessor<'hydrateRows'>>(
    (rows) => {
      console.log('hydrate rows', rows);
      const model = gridpinnedRowsModelSelector(apiRef.current.state);
      if (model === EMPTY_PINNED_ROWS) {
        return rows;
      }

      const topRowsVisible = model.top.filter(
        (id) => rows.dataRowIdToModelLookup[id] !== undefined,
      );
      const bottomRowsVisible = model.bottom.filter(
        (id) => rows.dataRowIdToModelLookup[id] !== undefined,
      );

      return rows;
    },
    [apiRef],
  );

  useGridRegisterPipeProcessor(apiRef, 'hydrateRows', hydratePinnedRows);

  React.useEffect(() => {
    if (props.pinnedRows) {
      apiRef.current.setPinnedRows(props.pinnedRows);
    }
  }, [apiRef, props.pinnedRows]);
};
