import clsx from 'clsx';
import * as React from 'react';
import { useThemedComponent } from '../context/GridThemeContext';
import { gridVisiblePinnedRowsSelector } from '../hooks/features/rowPinning';
import type { VirtualScroller } from '../hooks/features/virtualization/useGridVirtualScroller';
import { useGridPrivateApiContext } from '../hooks/utils/useGridPrivateApiContext';
import { useGridSelector } from '../hooks/utils/useGridSelector';

export interface GridPinnedRowsProps {
  position: 'top' | 'bottom';
  virtualScroller: VirtualScroller;
}

export function GridPinnedRows(props: GridPinnedRowsProps) {
  const apiRef = useGridPrivateApiContext();
  const { position, virtualScroller } = props;
  const classes = useThemedComponent('pinnedRows', {
    [position]: true,
  });

  const pinnedRows = useGridSelector(apiRef, gridVisiblePinnedRowsSelector)[position];

  const renderContext = React.useMemo(
    () => ({
      firstRowIndex: 0,
      lastRowIndex: pinnedRows.length,
      firstColumnIndex: virtualScroller.renderContext.firstColumnIndex,
      lastColumnIndex: virtualScroller.renderContext.lastColumnIndex,
    }),
    [
      pinnedRows.length,
      virtualScroller.renderContext.firstColumnIndex,
      virtualScroller.renderContext.lastColumnIndex,
    ],
  );

  const rows = virtualScroller.getRows({
    position,
    rows: pinnedRows,
    renderContext,
  });

  return (
    <div className={clsx(classes.root)} role="presentation">
      {rows}
    </div>
  );
}
