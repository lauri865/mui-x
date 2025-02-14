import { RefObject } from '@mui/x-internals/types';
import * as React from 'react';
import { GridPrivateApiCommunity } from '../../../models/api/gridApiCommunity';
import { GridInitialStateCommunity } from '../../../models/gridStateCommunity';
import { useGridApiMethod } from '../../utils';
import { GridStatePersistenceApi } from './gridStatePersistenceInterface';

export const useGridStatePersistence = (apiRef: RefObject<GridPrivateApiCommunity>) => {
  const exportState = React.useCallback<
    GridStatePersistenceApi<GridInitialStateCommunity>['exportState']
  >(
    (params = {}) => {
      const stateToExport = apiRef.current.unstable_applyPipeProcessors('exportState', {}, params);

      return stateToExport as GridInitialStateCommunity;
    },
    [apiRef],
  );

  const restoreState = React.useCallback<
    GridStatePersistenceApi<GridInitialStateCommunity>['restoreState']
  >(
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

  const statePersistenceApi: GridStatePersistenceApi<GridInitialStateCommunity> = {
    exportState,
    restoreState,
  };

  useGridApiMethod(apiRef, statePersistenceApi, 'public');
};
