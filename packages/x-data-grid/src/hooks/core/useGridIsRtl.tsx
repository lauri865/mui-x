import { RefObject } from '@mui/x-internals/types';
import * as React from 'react';
import { GridPrivateApiCommon } from '../../models/api/gridApiCommon';
import { GridState } from '../../models/gridStateCommunity';
import { useRtl } from '../utils/useRtl';

export const useGridIsRtl = (apiRef: RefObject<GridPrivateApiCommon>): void => {
  const isRtl = useRtl();

  if (apiRef.current.state.isRtl === undefined) {
    apiRef.current.state.isRtl = isRtl;
  }

  const isFirstEffect = React.useRef(true);
  React.useEffect(() => {
    if (isFirstEffect.current) {
      isFirstEffect.current = false;
    } else {
      apiRef.current.setState((state: GridState) => ({ ...state, isRtl }));
    }
  }, [apiRef, isRtl]);
};
