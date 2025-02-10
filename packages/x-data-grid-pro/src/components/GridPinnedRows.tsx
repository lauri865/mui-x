import { gridClasses, useGridSelector } from '@mui/x-data-grid';
import { useThemedComponent } from '@mui/x-data-grid/context/GridThemeContext';
import {
  GridPinnedRowsProps,
  gridPinnedRowsSelector,
  useGridPrivateApiContext,
} from '@mui/x-data-grid/internals';
import clsx from 'clsx';
import * as React from 'react';

export function GridPinnedRows({ position, virtualScroller }: GridPinnedRowsProps) {
  const classes = useThemedComponent('pinnedRows');
  const apiRef = useGridPrivateApiContext();

  const pinnedRowsData = useGridSelector(apiRef, gridPinnedRowsSelector);
  const rows = pinnedRowsData[position];

  const pinnedRenderContext = React.useMemo(
    () => ({
      firstRowIndex: 0,
      lastRowIndex: rows.length,
      firstColumnIndex: virtualScroller.renderContext.firstColumnIndex,
      lastColumnIndex: virtualScroller.renderContext.lastColumnIndex,
    }),
    [
      rows,
      virtualScroller.renderContext.firstColumnIndex,
      virtualScroller.renderContext.lastColumnIndex,
    ],
  );

  if (rows.length === 0) {
    return null;
  }

  const pinnedRows = virtualScroller.getRows({
    position,
    rows,
    renderContext: pinnedRenderContext,
  });

  return (
    <div className={clsx(classes.root, gridClasses[`pinnedRows--${position}`])} role="presentation">
      {pinnedRows}
    </div>
  );
}
