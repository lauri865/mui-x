import { RefObject } from '@mui/x-internals/types';
import * as React from 'react';
import { GridApiCommon } from '../../models';
import { GridApi } from '../../models/api/gridApiCommunity';

/**
 * Hook that instantiate a [[GridApiRef]].
 */
export const useGridApiRef = <Api extends GridApiCommon = GridApi>() =>
  React.useRef(null) as RefObject<Api | null>;
