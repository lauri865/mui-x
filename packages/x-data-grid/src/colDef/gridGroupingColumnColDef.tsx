import { GridGroupingCell } from '../components/cell/GridGroupingCell';
import { GridColDef } from '../models/colDef/gridColDef';

export const GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD = '«row_group_by_columns_group»';

export const GRID_GROUPING_COLUMN_COL_DEF: GridColDef = {
  type: 'custom',
  field: GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD,
  headerName: '',
  width: 200,
  editable: false,
  sortable: true,
  // @ts-ignore
  editable: false,
  groupable: false,
  aggregable: false,
  getApplyQuickFilterFn: undefined,
  display: 'flex',
  align: 'left',
  renderCell: GridGroupingCell,
};
