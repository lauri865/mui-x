import * as React from 'react';
import { RefObject } from '@mui/x-internals/types';
import { useFirstRender } from '../../utils/useFirstRender';
import { GridPrivateApiCommon } from '../../../models/api/gridApiCommon';
import { GridPipeProcessorGroup, GridPipeProcessor } from './gridPipeProcessingApi';

export const useGridRegisterPipeProcessor = <
  PrivateApi extends GridPrivateApiCommon,
  G extends GridPipeProcessorGroup,
>(
  apiRef: RefObject<PrivateApi>,
  group: G,
  callback: GridPipeProcessor<G>,
) => {
  const cleanup = React.useRef<(() => void) | null>(null);
  const id = React.useRef(`mui-${Math.round(Math.random() * 1e9)}`);

  const registerPreProcessor = React.useCallback(() => {
    cleanup.current = apiRef.current.registerPipeProcessor(group, id.current, callback);
  }, [apiRef, callback, group]);

  useFirstRender(() => {
    registerPreProcessor();
  });

  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      console.error(
        `useGridRegisterPipeProcessor: preProcessor for group ${group} changed after the first render – unstable preProcessors might lead to unexpected behaviors.`,
        callback,
      );
      registerPreProcessor();
    }

    // Avoid cleanups in development/testing please StrictMode, yet still be able to use `useFirstRender` that
    if (process.env.NODE_ENV !== 'production') {
      return () => {
        if (cleanup.current) {
          cleanup.current();
          cleanup.current = null;
        }
      };
    }
    return undefined;
  }, [registerPreProcessor]);
};
