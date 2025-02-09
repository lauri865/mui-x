import { GridRowId } from '../../../models/gridRows';

export type GridExpandedRowIds = Set<GridRowId>;

export const EMPTY_EXPANDED_DETAIL_PANELS: GridExpandedRowIds = new Set<GridRowId>();

export interface GridDetailPanelApi {
  toggleDetailPanel: (id: GridRowId) => void;
  isDetailPanelExpanded: (id: GridRowId) => boolean;
  getExpandedDetailPanels: () => GridExpandedRowIds;
  setExpandedDetailPanels: (model: GridExpandedRowIds) => void;
}

export interface GridDetailPanelPrivateApi {
  setDetailPanelHeight: (id: GridRowId, height: number) => void;
  getDetailPanelHeight: (id: GridRowId) => number;
}

export interface GridDetailPanelState {
  expandedRowIds: GridExpandedRowIds;
}

export type GridDetailPanelInitialState = {
  expandedRowIds?: GridExpandedRowIds;
};

export type GridDetailPanelCache = {
  expandingRowIds: GridExpandedRowIds;
};
