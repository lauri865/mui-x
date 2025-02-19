import { GridValidRowModel } from './gridRows';

export interface GridMeta<TData extends GridValidRowModel> {}

export interface GridMetaApi {
  meta: GridMeta<GridValidRowModel>;
}
