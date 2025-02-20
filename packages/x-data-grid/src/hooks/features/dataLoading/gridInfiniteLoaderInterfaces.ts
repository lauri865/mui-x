import { GridRowId, GridRowModel } from '../../../models';

export type InfiniteLoaderPayload = {
  viewportPageSize: number;
  visibleRowsCount: number;
  visibleColumns: any[];
  lastRowId?: GridRowId;
};

export type InfiniteLoaderOnRowsScrollEnd = (
  params: InfiniteLoaderPayload,
  detail: {
    setSkeletonRowCount: (count: number) => void;
  },
) => Promise<void | GridRowModel<any>[]>;
