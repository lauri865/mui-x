import useLazyRef from '@mui/utils/useLazyRef';
import { RefObject } from '@mui/x-internals/types';
import * as React from 'react';
import { GridPrivateApi } from '../../../models/api/gridApiCommunity';
import { GridState } from '../../../models/gridStateCommunity';
import { DataGridProcessedProps } from '../../../models/props/DataGridProps';
import { GridPipeProcessor, useGridRegisterPipeProcessor } from '../../core/pipeProcessing';
import {
  useGridApiEventHandler,
  useGridApiMethod,
  useGridLogger,
  useGridSelector,
} from '../../utils';
import { gridFilteredTopLevelRowCountSelector } from '../filter';
import { GridPaginationRowCountApi, GridPaginationState } from './gridPaginationInterfaces';
import {
  gridPaginationModelSelector,
  gridPaginationRowCountSelector,
} from './gridPaginationSelector';

const isLastPageSelector = (state: GridState) => state.pagination.meta.hasNextPage === false;

export const useGridRowCount = (
  apiRef: RefObject<GridPrivateApi>,
  props: Pick<
    DataGridProcessedProps,
    'rowCount' | 'initialState' | 'paginationMode' | 'onRowCountChange'
  >,
) => {
  const logger = useGridLogger(apiRef, 'useGridRowCount');

  const isLastPage = useGridSelector(apiRef, isLastPageSelector);
  const visibleTopLevelRowCount = useGridSelector(apiRef, gridFilteredTopLevelRowCountSelector);
  const previousPageSize = useLazyRef(() => gridPaginationModelSelector(apiRef).pageSize);

  apiRef.current.registerControlState({
    stateId: 'paginationRowCount',
    propModel: props.rowCount,
    propOnChange: props.onRowCountChange,
    stateSelector: gridPaginationRowCountSelector,
    changeEvent: 'rowCountChange',
  });

  /**
   * API METHODS
   */
  const setRowCount = React.useCallback<GridPaginationRowCountApi['setRowCount']>(
    (newRowCount) => {
      const rowCountState = gridPaginationRowCountSelector(apiRef);
      if (rowCountState === newRowCount) {
        return;
      }
      logger.debug("Setting 'rowCount' to", newRowCount);

      apiRef.current.setState((state) => ({
        ...state,
        pagination: {
          ...state.pagination,
          rowCount: newRowCount,
        },
      }));
    },
    [apiRef, logger],
  );

  const paginationRowCountApi: GridPaginationRowCountApi = {
    setRowCount,
  };

  useGridApiMethod(apiRef, paginationRowCountApi, 'public');

  /**
   * PRE-PROCESSING
   */
  const stateExportPreProcessing = React.useCallback<GridPipeProcessor<'exportState'>>(
    (prevState, context) => {
      const exportedRowCount = gridPaginationRowCountSelector(apiRef);

      const shouldExportRowCount =
        // Always export if the `exportOnlyDirtyModels` property is not activated
        !context.exportOnlyDirtyModels ||
        // Always export if the `rowCount` is controlled
        props.rowCount != null ||
        // Always export if the `rowCount` has been initialized
        props.initialState?.pagination?.rowCount != null;

      if (!shouldExportRowCount) {
        return prevState;
      }

      return {
        ...prevState,
        pagination: {
          ...prevState.pagination,
          rowCount: exportedRowCount,
        },
      };
    },
    [apiRef, props.rowCount, props.initialState?.pagination?.rowCount],
  );

  const stateRestorePreProcessing = React.useCallback<GridPipeProcessor<'restoreState'>>(
    (params, context) => {
      const restoredRowCount = context.stateToRestore.pagination?.rowCount
        ? context.stateToRestore.pagination.rowCount
        : gridPaginationRowCountSelector(apiRef);
      apiRef.current.setState((state) => ({
        ...state,
        pagination: {
          ...state.pagination,
          rowCount: restoredRowCount,
        },
      }));
      return params;
    },
    [apiRef],
  );

  useGridRegisterPipeProcessor(apiRef, 'exportState', stateExportPreProcessing);
  useGridRegisterPipeProcessor(apiRef, 'restoreState', stateRestorePreProcessing);

  /**
   * EVENTS
   */
  const handlePaginationModelChange = React.useCallback(
    (model: GridPaginationState['paginationModel']) => {
      if (props.paginationMode === 'client' || !previousPageSize.current) {
        return;
      }
      if (model.pageSize !== previousPageSize.current) {
        const rowCountState = gridPaginationRowCountSelector(apiRef);
        previousPageSize.current = model.pageSize;
        if (rowCountState === -1) {
          // Row count unknown and page size changed, reset the page
          apiRef.current.setPage(0);
        }
      }
    },
    [props.paginationMode, previousPageSize, apiRef],
  );

  useGridApiEventHandler(apiRef, 'paginationModelChange', handlePaginationModelChange);

  /**
   * EFFECTS
   */
  React.useEffect(() => {
    if (props.paginationMode === 'client') {
      apiRef.current.setRowCount(visibleTopLevelRowCount);
    } else if (props.rowCount != null) {
      apiRef.current.setRowCount(props.rowCount);
    }
  }, [apiRef, props.paginationMode, visibleTopLevelRowCount, props.rowCount]);

  React.useEffect(() => {
    const paginationModel = gridPaginationModelSelector(apiRef);
    const rowCountState = gridPaginationRowCountSelector(apiRef);
    if (isLastPage && rowCountState === -1) {
      apiRef.current.setRowCount(
        paginationModel.pageSize * paginationModel.page + visibleTopLevelRowCount,
      );
    }
  }, [apiRef, isLastPage, visibleTopLevelRowCount]);
};
