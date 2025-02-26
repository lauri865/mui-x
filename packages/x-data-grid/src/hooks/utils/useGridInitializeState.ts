import { RefObject } from '@mui/x-internals/types';
import * as React from 'react';
import { GridPrivateApiCommon } from '../../models/api/gridApiCommon';
import { GridPrivateApi } from '../../models/api/gridApiCommunity';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type GridStateInitializer<
  P extends Partial<DataGridProcessedProps> = DataGridProcessedProps,
  PrivateApi extends GridPrivateApiCommon = GridPrivateApi,
> = (
  state: DeepPartial<PrivateApi['state']>,
  props: P,
  privateApiRef: RefObject<PrivateApi>,
) => DeepPartial<PrivateApi['state']>;

export const useGridInitializeState = <
  P extends Partial<DataGridProcessedProps>,
  PrivateApi extends GridPrivateApiCommon = GridPrivateApi,
>(
  initializer: GridStateInitializer<P, PrivateApi>,
  privateApiRef: RefObject<PrivateApi>,
  props: P,
) => {
  const isInitialized = React.useRef(false);

  if (!isInitialized.current) {
    privateApiRef.current.state = initializer(
      privateApiRef.current.state,
      props,
      privateApiRef,
    ) as PrivateApi['state'];
    isInitialized.current = true;
  }
};
