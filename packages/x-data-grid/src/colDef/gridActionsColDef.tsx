import { renderActionsCell } from '../components/cell/GridActionsCell';
import { GridColTypeDef } from '../models/colDef/gridColDef';
import { GRID_STRING_COL_DEF } from './gridStringColDef';

export const GRID_ACTIONS_COLUMN_TYPE = 'actions';

export const GRID_ACTIONS_COL_DEF: GridColTypeDef = {
  ...GRID_STRING_COL_DEF,
  type: 'actions',
  sortable: false,
  filterable: false,
  // @ts-ignore
  aggregable: false,
  width: 100,
  display: 'flex',
  align: 'center',
  headerAlign: 'center',
  headerName: '',
  disableColumnMenu: true,
  disableExport: true,
  renderCell: renderActionsCell,
  getApplyQuickFilterFn: undefined,
};
