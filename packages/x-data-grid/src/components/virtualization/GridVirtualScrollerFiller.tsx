import { fastMemo } from '@mui/x-internals/fastMemo';
import clsx from 'clsx';
import * as React from 'react';
import { gridClasses } from '../../constants';
import { gridDimensionsSelector } from '../../hooks/features/dimensions';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridSelector } from '../../hooks/utils/useGridSelector';

type Props = {
  /** The number of rows */
  rowsLength: number;
};

function GridVirtualScrollerFiller({ rowsLength }: Props) {
  const apiRef = useGridApiContext();
  const {
    viewportOuterSize,
    minimumSize,
    hasScrollX,
    hasScrollY,
    scrollbarSize,
    leftPinnedWidth,
    rightPinnedWidth,
  } = useGridSelector(apiRef, gridDimensionsSelector);

  const height = hasScrollX ? scrollbarSize : 0;
  const needsLastRowBorder = viewportOuterSize.height - minimumSize.height > 0;

  if (height === 0 && !needsLastRowBorder) {
    return null;
  }

  return (
    <div
      className={clsx(
        gridClasses.filler,
        'flex flex-row w-[var(--DataGrid-rowWidth)] box-border flex-[1_0_auto]',
      )}
      role="presentation"
      style={
        {
          height,
          '--rowBorderColor': rowsLength === 0 ? 'transparent' : 'var(--color-grid-border)',
        } as React.CSSProperties
      }
    >
      {leftPinnedWidth > 0 && (
        <div
          className={clsx(
            'sticky h-full box-border border-t border-t-grid-border bg-grid-pinned-bg',
            'left-0 border-r- border-r-grid-border',
            gridClasses['filler--pinnedLeft'],
          )}
          style={{ width: leftPinnedWidth }}
        />
      )}
      <div className="flex-1 border-t border-t-grid-border" />
      {rightPinnedWidth > 0 && (
        <div
          className={clsx(
            'sticky h-full box-border border-t border-t-grid-border bg-grid-pinned-bg',
            'border-l border-l-grid-border right-0',
            gridClasses['filler--pinnedRight'],
          )}
          style={{ width: rightPinnedWidth + (hasScrollY ? scrollbarSize : 0) }}
        />
      )}
    </div>
  );
}

const Memoized = fastMemo(GridVirtualScrollerFiller);

export { Memoized as GridVirtualScrollerFiller };
