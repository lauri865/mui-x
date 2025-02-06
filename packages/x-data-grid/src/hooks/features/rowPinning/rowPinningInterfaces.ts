import { GridRowId } from '../../../models/gridRows';

export enum GridPinnedRowPosition {
  top = 'top',
  bottom = 'bottom',
}

export interface GridPinnedRowsModel {
  top: GridRowId[];
  bottom: GridRowId[];
}

export interface GridPinnedRowsState {
  model: GridPinnedRowsModel;
  visible: GridPinnedRowsModel;
}

export const EMPTY_PINNED_ROWS: GridPinnedRowsModel = {
  top: [],
  bottom: [],
};

export interface GridRowPinningApi {
  /**
   * Pin the row at the specified index.
   * @param {GridRowId} rowIndex - The id of the row to pin.
   */
  pinRow: (id: GridRowId, position: GridPinnedRowPosition) => void;
  /**
   * Unpin the row at the specified index.
   * @param {GridRowId} rowId - The id of the row to unpin.
   */
  unpinRow: (id: GridRowId) => void;
  /**
   * Unpin all the rows.
   */
  unpinAllRows: () => void;
  /**
   * Check if the row at the specified index is pinned.
   * @param {GridRowId} rowId - The id of the row to check.
   * @returns {boolean} - Whether the row is pinned.
   */
  isRowPinned: (id: number) => boolean;
  /**
   * Get the row's pinned position.
   * @param {GridRowId} rowId - The id of the row.
   * @returns {GridPinnedRowPosition | null} - The row's pinned position.
   */
  getRowPinnedPosition: (id: GridRowId) => GridPinnedRowPosition | null;
  /**
   * Get the pinned rows.
   * @returns {GridPinnedRowsModel} - The pinned rows.
   */
  getPinnedRows: () => GridPinnedRowsModel;
  /**
   * Set the pinned rows.
   * @param {GridPinnedRowsModel} pinnedRows - The pinned rows to set.
   */
  setPinnedRows: (pinnedRows: GridPinnedRowsModel) => void;
}

export interface GridRowPinningProps {
  pinnedRows: GridPinnedRowsModel;
}
