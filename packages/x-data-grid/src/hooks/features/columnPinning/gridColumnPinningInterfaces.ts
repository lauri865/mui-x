import { GridPinnedColumnPosition, GridPinnedColumnFields } from '../columns/gridColumnsInterfaces';

export interface GridColumnPinningApi {
  pinColumn: (field: string, side: GridPinnedColumnPosition) => void;
  unpinColumn: (field: string) => void;
  isColumnPinned: (field: string) => boolean;
  getColumnPinnedPosition: (field: string) => GridPinnedColumnPosition | null;
  setPinnedColumns: (pinnedColumns: GridPinnedColumnFields) => void;
  getPinnedColumns: () => GridPinnedColumnFields;
}
export type GridColumnPinningState = {
  model: GridPinnedColumnFields;
  visible: GridPinnedColumnFields;
};
