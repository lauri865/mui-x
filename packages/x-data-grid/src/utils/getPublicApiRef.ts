import { RefObject } from '@mui/x-internals/types';
import type { GridPrivateApi } from '../models/api/gridApiCommunity';

export function getPublicApiRef<PrivateApi extends GridPrivateApi>(apiRef: RefObject<PrivateApi>) {
  return { current: apiRef.current.getPublicApi() } as RefObject<
    ReturnType<PrivateApi['getPublicApi']>
  >;
}
