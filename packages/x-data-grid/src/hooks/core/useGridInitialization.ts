import { unstable_useEventCallback } from '@mui/utils';
import { RefObject } from '@mui/x-internals/types';
import type { GridApiCommon, GridPrivateApiCommon } from '../../models/api/gridApiCommon';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';
import { useGridPipeProcessing } from './pipeProcessing';
import { useGridStrategyProcessing } from './strategyProcessing';
import { useGridApiInitialization } from './useGridApiInitialization';
import { useGridIsRtl } from './useGridIsRtl';
import { useGridLocaleText } from './useGridLocaleText';
import { useGridLoggerFactory } from './useGridLoggerFactory';
import { useGridRefs } from './useGridRefs';
import { useGridStateInitialization } from './useGridStateInitialization';

/**
 * Initialize the technical pieces of the DataGrid (logger, state, ...) that any DataGrid implementation needs
 */
export const useGridInitialization = <
  PrivateApi extends GridPrivateApiCommon,
  Api extends GridApiCommon,
>(
  inputApiRef: RefObject<Api | null> | undefined,
  props: DataGridProcessedProps,
) => {
  const privateApiRef = useGridApiInitialization<PrivateApi, Api>(inputApiRef, props);

  useGridRefs(privateApiRef);
  useGridIsRtl(privateApiRef);
  useGridLoggerFactory(privateApiRef, props);
  useGridStateInitialization(privateApiRef);
  useGridPipeProcessing(privateApiRef);
  useGridStrategyProcessing(privateApiRef);
  useGridLocaleText(privateApiRef, props);

  const getRootProps = unstable_useEventCallback(() => props);

  privateApiRef.current.register('public', { meta: props.meta });
  privateApiRef.current.register('private', { rootProps: props, getRootProps });

  return privateApiRef;
};
