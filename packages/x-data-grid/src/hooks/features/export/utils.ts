import { RefObject } from '@mui/x-internals/types';
import { GridRowId } from '../../../models';
import { GridApiCommunity } from '../../../models/api/gridApiCommunity';
import { GridStateColDef } from '../../../models/colDef/gridColDef';
import { GridCsvGetRowsToExportParams, GridExportOptions } from '../../../models/gridExport';
import { gridColumnDefinitionsSelector, gridVisibleColumnDefinitionsSelector } from '../columns';
import { gridVisibleRowIdsWithPinnedRowsSelector } from '../rowPinning/gridRowPinningInternalSelector';

interface GridGetColumnsToExportParams {
  /**
   * The API of the grid.
   */
  apiRef: RefObject<GridApiCommunity>;
  options: GridExportOptions;
}

export const getColumnsToExport = ({
  apiRef,
  options,
}: GridGetColumnsToExportParams): GridStateColDef[] => {
  const columns = gridColumnDefinitionsSelector(apiRef);

  if (options.fields) {
    return options.fields.reduce<GridStateColDef[]>((currentColumns, field) => {
      const column = columns.find((col) => col.field === field);
      if (column) {
        currentColumns.push(column);
      }
      return currentColumns;
    }, []);
  }

  const validColumns = options.allColumns ? columns : gridVisibleColumnDefinitionsSelector(apiRef);
  return validColumns.filter((column) => !column.disableExport);
};

export const defaultGetRowsToExport = ({ apiRef }: GridCsvGetRowsToExportParams): GridRowId[] => {
  const selectedRows = apiRef.current.getSelectedRows();
  const bodyRows = gridVisibleRowIdsWithPinnedRowsSelector(apiRef);

  if (selectedRows.size > 0) {
    return bodyRows.filter((id) => selectedRows.has(id));
  }

  return bodyRows;
};
