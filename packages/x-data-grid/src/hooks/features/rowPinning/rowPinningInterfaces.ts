import { GridRowId } from '../../../models/gridRows';

export enum GridPinnedRowPosition {
  top = 'top',
  bottom = 'bottom',
}

export interface GridPinnedRowsModel {
  top: GridRowId[];
  bottom: GridRowId[];
}

export type GridPinnedRowsState = GridPinnedRowsModel;

export const EMPTY_PINNED_ROWS: GridPinnedRowsModel = {
  top: [],
  bottom: [],
};

export interface GridRowPinningApi {
  /**
   * Pin the row at the specified index.
   * @param {GridRowId} rowIndex - The id of the row to pin.
   * @param id
   * @param position
   */
  pinRow: (id: GridRowId, position: GridPinnedRowPosition) => void;
  /**
   * Unpin the row at the specified index.
   * @param {GridRowId} rowId - The id of the row to unpin.
   * @param id
   */
  unpinRow: (id: GridRowId) => void;
  /**
   * Unpin all the rows.
   */
  unpinAllRows: () => void;
  /**
   * Check if the row at the specified index is pinned.
   * @param {GridRowId} rowId - The id of the row to check.
   * @param id
   * @returns {boolean} - Whether the row is pinned.
   */
  isRowPinned: (id: GridRowId) => boolean;
  /**
   * Get the row's pinned position.
   * @param {GridRowId} rowId - The id of the row.
   * @param id
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
