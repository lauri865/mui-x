import { RefObject } from '@mui/x-internals/types';
import * as React from 'react';
import { GridPrivateApi } from '../../../models/api/gridApiCommunity';
import { GridInitialState } from '../../../models/gridStateCommunity';
import { useGridApiMethod } from '../../utils';
import { GridStatePersistenceApi } from './gridStatePersistenceInterface';

export const useGridStatePersistence = (apiRef: RefObject<GridPrivateApi>) => {
  const exportState = React.useCallback<GridStatePersistenceApi<GridInitialState>['exportState']>(
    (params = {}) => {
      const stateToExport = apiRef.current.unstable_applyPipeProcessors('exportState', {}, params);

      return stateToExport as GridInitialState;
    },
    [apiRef],
  );

  const restoreState = React.useCallback<GridStatePersistenceApi<GridInitialState>['restoreState']>(
    (stateToRestore) => {
      const response = apiRef.current.unstable_applyPipeProcessors(
        'restoreState',
        {
          callbacks: [],
        },
        {
          stateToRestore,
        },
      );

      response.callbacks.forEach((callback) => {
        callback();
      });
    },
    [apiRef],
  );

  const statePersistenceApi: GridStatePersistenceApi<GridInitialState> = {
    exportState,
    restoreState,
  };

  useGridApiMethod(apiRef, statePersistenceApi, 'public');
};
