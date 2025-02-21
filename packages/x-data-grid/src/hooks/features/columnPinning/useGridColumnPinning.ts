import { RefObject } from '@mui/x-internals/types';
import * as React from 'react';
import type { GridPrivateApiCommunity } from '../../../models/api/gridApiCommunity';
import type { DataGridProcessedProps } from '../../../models/props/DataGridProps';
import { gridIsRtlSelector } from '../../core/gridCoreSelector';
import { GridPipeProcessor, useGridRegisterPipeProcessor } from '../../core/pipeProcessing';
import { useGridApiMethod } from '../../utils/useGridApiMethod';
import { GridStateInitializer } from '../../utils/useGridInitializeState';
import {
  EMPTY_PINNED_COLUMN_FIELDS,
  GridColumnsState,
  GridPinnedColumnFields,
  GridPinnedColumnPosition,
} from '../columns/gridColumnsInterfaces';
import {
  gridColumnPositionsSelector,
  gridPinnedColumnsSelector,
  gridVisibleColumnDefinitionsSelector,
  gridVisiblePinnedColumnsSelector,
} from '../columns/gridColumnsSelector';
import { gridDimensionsSelector } from '../dimensions';
import { GridColumnPinningApi, GridColumnPinningState } from './gridColumnPinningInterfaces';

export const columnPinningStateInitializer: GridStateInitializer<
  Pick<DataGridProcessedProps, 'pinnedColumns' | 'initialState' | 'columnVisibilityModel'>
> = (state, props, apiRef) => {
  const model =
    props.pinnedColumns ?? props.initialState?.pinnedColumns ?? EMPTY_PINNED_COLUMN_FIELDS;
  return {
    ...state,
    pinnedColumns: {
      model,
      visible: model,
    },
  };
};

export const useGridColumnPinning = (
  apiRef: RefObject<GridPrivateApiCommunity>,
  props: Pick<DataGridProcessedProps, 'pinnedColumns'>,
) => {
  const positionBeforePinning = React.useRef<Map<string, number>>(new Map());
  const setPinnedColumns = React.useCallback(
    (pinnedColumns: GridPinnedColumnFields) => {
      const currentPinnedColumns = gridPinnedColumnsSelector(apiRef.current.state);
      if (pinnedColumns === currentPinnedColumns) {
        return;
      }

      let newPinnedColumns = pinnedColumns;
      if (!newPinnedColumns.left.length && !newPinnedColumns.right?.length) {
        newPinnedColumns = EMPTY_PINNED_COLUMN_FIELDS;
      }

      apiRef.current.setState((state) => ({
        ...state,
        pinnedColumns: getPinnedColumnState(newPinnedColumns, state.columns),
      }));
      apiRef.current.requestPipeProcessorsApplication('hydrateColumns');
    },
    [apiRef],
  );

  const pinColumn = React.useCallback(
    (field: string, side: GridPinnedColumnPosition) => {
      const currentPosition = apiRef.current.getColumnPinnedPosition(field);
      const state = gridPinnedColumnsSelector(apiRef.current.state);
      const newState = { ...state, [side]: [...state[side], field] };
      if (currentPosition !== null) {
        newState[currentPosition] = state[currentPosition].filter((f) => f !== field);
      } else {
        positionBeforePinning.current.set(field, apiRef.current.getColumnIndex(field, false));
      }
      apiRef.current.setPinnedColumns(newState);
    },
    [apiRef],
  );

  const unpinColumn = React.useCallback(
    (field: string) => {
      const position = apiRef.current.getColumnPinnedPosition(field);
      if (position === null) {
        return;
      }
      const state = gridPinnedColumnsSelector(apiRef.current.state);
      const newState = { ...state, [position]: state[position].filter((f) => f !== field) };

      if (positionBeforePinning.current.has(field)) {
        const index = positionBeforePinning.current.get(field)!;
        apiRef.current.setColumnIndex(field, index, false);
        positionBeforePinning.current.delete(field);
      }

      apiRef.current.setPinnedColumns(newState);
    },
    [apiRef],
  );

  const getColumnPinnedPosition = React.useCallback(
    (field: string) => {
      const pinnedColumns = gridPinnedColumnsSelector(apiRef.current.state);
      if (pinnedColumns === EMPTY_PINNED_COLUMN_FIELDS) {
        return null;
      }
      if (pinnedColumns.left?.includes(field)) {
        return GridPinnedColumnPosition.LEFT;
      }
      if (pinnedColumns.right?.includes(field)) {
        return GridPinnedColumnPosition.RIGHT;
      }
      return null;
    },
    [apiRef],
  );

  const isColumnPinned = React.useCallback(
    (field: string) => {
      return getColumnPinnedPosition(field) !== null;
    },
    [apiRef],
  );

  const getPinnedColumns = React.useCallback(
    () => gridPinnedColumnsSelector(apiRef.current.state),
    [apiRef],
  );

  const methods: GridColumnPinningApi = {
    pinColumn,
    unpinColumn,
    setPinnedColumns,
    getPinnedColumns,
    isColumnPinned,
    getColumnPinnedPosition,
  };

  useGridApiMethod(apiRef, methods, 'public');

  React.useEffect(() => {
    if (props.pinnedColumns) {
      apiRef.current.setPinnedColumns(props.pinnedColumns);
    }
  }, [apiRef, props.pinnedColumns]);
};

export function getPinnedColumnState(
  pinnedColumns: GridPinnedColumnFields,
  columns: GridColumnsState,
): GridColumnPinningState {
  return {
    model: pinnedColumns,
    visible: keepVisiblePinnedColumns(pinnedColumns, columns),
  };
}

function keepVisiblePinnedColumns(
  pinnedColumns: GridPinnedColumnFields,
  columns: GridColumnsState,
) {
  if (!pinnedColumns.left.length && !pinnedColumns.right?.length) {
    return EMPTY_PINNED_COLUMN_FIELDS;
  }

  const left = pinnedColumns.left.length
    ? pinnedColumns.left.filter(
        (field) =>
          columns.lookup[field] !== undefined && columns.columnVisibilityModel[field] !== false,
      )
    : EMPTY_PINNED_COLUMN_FIELDS.left;
  const right = pinnedColumns.right.length
    ? pinnedColumns.right.filter(
        (field) =>
          columns.lookup[field] !== undefined && columns.columnVisibilityModel[field] !== false,
      )
    : EMPTY_PINNED_COLUMN_FIELDS.right;

  if (left.length === 0 && right.length === 0) {
    return EMPTY_PINNED_COLUMN_FIELDS;
  }

  if (left.length === pinnedColumns.left.length && right.length === pinnedColumns.right.length) {
    return pinnedColumns;
  }

  return {
    left,
    right,
  };
}

export const useGridColumnPinningPreProcessors = (
  apiRef: RefObject<GridPrivateApiCommunity>,
  _: Pick<DataGridProcessedProps, 'pinnedColumns'>,
) => {
  const hydratePinnedColumns = React.useCallback<GridPipeProcessor<'hydrateColumns'>>(
    (columns) => {
      if (columns.orderedFields.length === 0) {
        return columns;
      }

      const pinnedColumns = gridPinnedColumnsSelector(apiRef.current.state);
      const hasPinnedColumns = pinnedColumns.left?.length || pinnedColumns.right?.length;

      if (!hasPinnedColumns) {
        return columns;
      }

      const filteredColumns = columns.orderedFields.filter(
        (field) => !(pinnedColumns.left?.includes(field) || pinnedColumns.right?.includes(field)),
      );

      const visiblePinnedColumns = getPinnedColumnState(
        pinnedColumns,
        columns as GridColumnsState,
      ).visible;

      const isRtl = gridIsRtlSelector(apiRef.current.state);
      apiRef.current.state.pinnedColumns.visible = visiblePinnedColumns;

      const newOrderedFields = [
        ...(pinnedColumns.left ?? []).filter((field) => columns.lookup[field] !== undefined),
        ...filteredColumns,
        ...(pinnedColumns.right ?? []).filter((field) => columns.lookup[field] !== undefined),
      ];

      return {
        ...columns,
        orderedFields: newOrderedFields,
      };
    },
    [apiRef],
  );

  const scrollToPinnedIndexes = React.useCallback<GridPipeProcessor<'scrollToIndexes'>>(
    (params, context) => {
      const visiblePinnedColumns = gridVisiblePinnedColumnsSelector(apiRef.current.state);
      if (
        (!visiblePinnedColumns.left.length && !visiblePinnedColumns.right.length) ||
        !context.colIndex
      ) {
        return params;
      }
      const visibleColumns = gridVisibleColumnDefinitionsSelector(apiRef.current.state);
      const colIndex = context.colIndex;
      const isNavigatingToPinnedColumn =
        colIndex < visiblePinnedColumns.left.length ||
        colIndex >= visibleColumns.length - visiblePinnedColumns.right.length;
      if (isNavigatingToPinnedColumn) {
        return params;
      }

      const columnPositions = gridColumnPositionsSelector(apiRef.current.state);
      const scrollLeft = apiRef.current.scrollPositionRef.current.left;
      const {
        leftPinnedWidth,
        rightPinnedWidth,
        viewportOuterSize: { width: scrollerWidth },
      } = gridDimensionsSelector(apiRef.current.state);

      // Calculate target column's starting position and width.
      const columnStart = columnPositions[colIndex];
      const columnWidth = columnPositions[colIndex + 1] - columnStart;

      let newScrollLeft = scrollLeft;
      // Check if column is hidden behind left pinned area.
      if (columnStart < scrollLeft + leftPinnedWidth) {
        newScrollLeft = columnStart - leftPinnedWidth;
      }
      // Or if column's right edge is hidden behind right pinned area.
      else if (columnStart + columnWidth > scrollLeft + scrollerWidth - rightPinnedWidth) {
        newScrollLeft = columnStart + columnWidth - scrollerWidth + rightPinnedWidth;
      }

      if (newScrollLeft !== scrollLeft) {
        return {
          ...params,
          left: newScrollLeft,
        };
      }
      return params;
    },
    [apiRef],
  );

  const addColumnMenuItem = React.useCallback<GridPipeProcessor<'columnMenu'>>((columnMenu) => {
    return [...columnMenu, 'columnMenuColumnPinning'];
  }, []);

  useGridRegisterPipeProcessor(apiRef, 'hydrateColumns', hydratePinnedColumns);
  useGridRegisterPipeProcessor(apiRef, 'scrollToIndexes', scrollToPinnedIndexes);
  useGridRegisterPipeProcessor(apiRef, 'columnMenu', addColumnMenuItem);
};
