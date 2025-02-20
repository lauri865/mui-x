import { GridGroupingCell } from '../components/cell/GridGroupingCell';
import { gridFilteredRowGroupingModel } from '../hooks/features/rowGrouping/rowGroupingSelector';
import { GridColDef } from '../models/colDef/gridColDef';

export const GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD = '«row_group_by_columns_group»';

export const GRID_GROUPING_COLUMN_COL_DEF: GridColDef = {
  type: 'custom',
  field: GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD,
  headerName: '',
  width: 200,
  editable: false,
  sortable: true,
  resizable: true,
  // @ts-ignore
  editable: false,
  groupable: false,
  aggregable: false,
  getApplyQuickFilterFn: undefined,
  display: 'flex',
  align: 'left',
  renderCell: GridGroupingCell,
  disableExport: false,
  valueGetter: (value, row, col, apiRef) => {
    const id = apiRef.current.getRowId(row);
    const node = apiRef.current.getRowNode(id);
    if (node?.type === 'group') {
      return node.groupingKey;
    }
    return value;
  },
  sortComparator: (_, __, cellA, cellB) => {
    // We only want to sort the groups of the current grouping criteria
    if (cellA.rowNode.type === 'group' || cellB.rowNode.type === 'group') {
      throw new Error('Not implemented');
      return 0;
    }

    const api = cellA.api;

    const sortComparators = gridFilteredRowGroupingModel(api.state).map((field) => {
      const colDef = api.getColumn(field);
      return {
        field,
        colDef,
        comparator: colDef.sortComparator,
      };
    });

    for (let i = 0; i < sortComparators.length; i += 1) {
      const col = sortComparators[i];
      const comparator = col.comparator;
      if (!comparator) {
        continue;
      }

      const a = api.getCellValue(cellA.id, col.field);
      const b = api.getCellValue(cellB.id, col.field);

      const result = comparator(
        a,
        b,
        {
          ...cellA,
          field: col.field,
          value: a,
        },
        {
          ...cellB,
          field: col.field,
          value: b,
        },
      );

      if (result !== 0) {
        return result;
      }
    }

    return 0;
  },
};
