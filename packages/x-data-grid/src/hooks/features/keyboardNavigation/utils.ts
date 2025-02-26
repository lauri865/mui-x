import { RefObject } from '@mui/x-internals/types';
import { GridColDef, GridRowId } from '../../../models';
import { GridApi } from '../../../models/api/gridApiCommunity';
import { gridFilteredSortedRowIdsSelector } from '../filter/gridFilterSelector';
import { gridRowSpanningHiddenCellsSelector } from '../rows/gridRowSpanningSelectors';

export const getLeftColumnIndex = ({
  currentColIndex,
  firstColIndex,
  lastColIndex,
  isRtl,
}: {
  currentColIndex: number;
  firstColIndex: number;
  lastColIndex: number;
  isRtl: boolean;
}) => {
  if (isRtl) {
    if (currentColIndex < lastColIndex) {
      return currentColIndex + 1;
    }
  } else if (!isRtl) {
    if (currentColIndex > firstColIndex) {
      return currentColIndex - 1;
    }
  }
  return null;
};

export const getRightColumnIndex = ({
  currentColIndex,
  firstColIndex,
  lastColIndex,
  isRtl,
}: {
  currentColIndex: number;
  firstColIndex: number;
  lastColIndex: number;
  isRtl: boolean;
}) => {
  if (isRtl) {
    if (currentColIndex > firstColIndex) {
      return currentColIndex - 1;
    }
  } else if (!isRtl) {
    if (currentColIndex < lastColIndex) {
      return currentColIndex + 1;
    }
  }
  return null;
};

export function findNonRowSpannedCell(
  apiRef: RefObject<GridApi>,
  rowId: GridRowId,
  field: GridColDef['field'],
  rowSpanScanDirection: 'up' | 'down',
) {
  const rowSpanHiddenCells = gridRowSpanningHiddenCellsSelector(apiRef);
  if (!rowSpanHiddenCells[rowId]?.[field]) {
    return rowId;
  }
  const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef);
  // find closest non row spanned cell in the given `rowSpanScanDirection`
  let nextRowIndex =
    filteredSortedRowIds.indexOf(rowId) + (rowSpanScanDirection === 'down' ? 1 : -1);
  while (nextRowIndex >= 0 && nextRowIndex < filteredSortedRowIds.length) {
    const nextRowId = filteredSortedRowIds[nextRowIndex];
    if (!rowSpanHiddenCells[nextRowId]?.[field]) {
      return nextRowId;
    }
    nextRowIndex += rowSpanScanDirection === 'down' ? 1 : -1;
  }
  return rowId;
}
