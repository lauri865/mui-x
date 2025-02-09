import { GridDetailPanelCell } from '../components/detailPanel/GridDetailPanelCellRenderer';
import { GridColDef } from '../models/colDef/gridColDef';

export const GRID_DETAIL_PANEL_TOGGLE_FIELD = '«detail_panel_toggle»';

export const GRID_DETAIL_PANEL_COL_DEF: GridColDef = {
  type: 'custom',
  field: GRID_DETAIL_PANEL_TOGGLE_FIELD,
  headerName: '',
  width: 40,
  editable: false,
  resizable: false,
  sortable: false,
  filterable: false,
  // @ts-ignore
  aggregable: false,
  disableColumnMenu: true,
  disableExport: true,
  getApplyQuickFilterFn: undefined,
  display: 'flex',
  align: 'center',
  renderCell: (params) => <GridDetailPanelCell {...params} />,
};
