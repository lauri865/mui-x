'use client';
import { unstable_useEventCallback as useEventCallback } from '@mui/utils';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { fastMemo } from '@mui/x-internals/fastMemo';
import { RefObject } from '@mui/x-internals/types';
import clsx from 'clsx';
import * as React from 'react';
import { getTotalHeaderHeight } from '../hooks/features/columns/gridColumnsUtils';
import { gridDensityFactorSelector } from '../hooks/features/density/densitySelector';
import { gridDimensionsSelector } from '../hooks/features/dimensions/gridDimensionsSelectors';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { useGridApiEventHandler } from '../hooks/utils/useGridApiEventHandler';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';
import { useGridSelector } from '../hooks/utils/useGridSelector';
import { useTimeout } from '../hooks/utils/useTimeout';
import { gridDimensionsColumnsTotalWidthSelector } from '../internals/selectors/dimensionSelectors';
import { GridEventListener } from '../models/events';
import { GridScrollParams } from '../models/params/gridScrollParams';
import { createSelector } from '../utils/createSelector';

const CLIFF = 1;
const SLOP = 1.5;

interface ScrollAreaProps {
  scrollDirection: 'left' | 'right';
  scrollPosition: RefObject<GridScrollParams>;
}

const offsetSelector = createSelector(
  gridDimensionsSelector,
  (dimensions, direction: ScrollAreaProps['scrollDirection']) => {
    if (direction === 'left') {
      return dimensions.leftPinnedWidth;
    }
    if (direction === 'right') {
      return dimensions.rightPinnedWidth + (dimensions.hasScrollX ? dimensions.scrollbarSize : 0);
    }
    return 0;
  },
);

function GridScrollAreaWrapper(props: ScrollAreaProps) {
  const apiRef = useGridApiContext();
  const [dragging, setDragging] = React.useState<boolean>(false);

  const handleColumnHeaderDragStart = () => {
    setDragging(true);
  };

  const handleColumnHeaderDragEnd = () => {
    setDragging(false);
  };

  useGridApiEventHandler(apiRef, 'columnHeaderDragStart', handleColumnHeaderDragStart);
  useGridApiEventHandler(apiRef, 'columnHeaderDragEnd', handleColumnHeaderDragEnd);

  if (!dragging) {
    return null;
  }

  return <GridScrollAreaContent {...props} />;
}

function GridScrollAreaContent(props: ScrollAreaProps) {
  const { scrollDirection, scrollPosition } = props;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const apiRef = useGridApiContext();
  const timeout = useTimeout();
  const densityFactor = useGridSelector(apiRef, gridDensityFactorSelector);
  const columnsTotalWidth = useGridSelector(apiRef, gridDimensionsColumnsTotalWidthSelector);
  const sideOffset = useGridSelector(apiRef, offsetSelector, scrollDirection);

  const getCanScrollMore = () => {
    const dimensions = gridDimensionsSelector(apiRef.current.state);
    if (scrollDirection === 'left') {
      // Only render if the user has not reached yet the start of the list
      return scrollPosition.current.left > 0;
    }

    if (scrollDirection === 'right') {
      // Only render if the user has not reached yet the end of the list
      const maxScrollLeft = columnsTotalWidth - dimensions.viewportInnerSize.width;
      return scrollPosition.current.left < maxScrollLeft;
    }

    return false;
  };

  const [canScrollMore, setCanScrollMore] = React.useState<boolean>(getCanScrollMore);

  const rootProps = useGridRootProps();
  const totalHeaderHeight = getTotalHeaderHeight(apiRef, rootProps);
  const headerHeight = Math.floor(rootProps.columnHeaderHeight * densityFactor);

  const style: React.CSSProperties = {
    height: gridDimensionsSelector(apiRef.current.state).viewportOuterSize.height,
    top: totalHeaderHeight - headerHeight,
  };

  if (scrollDirection === 'left') {
    style.left = sideOffset;
  } else if (scrollDirection === 'right') {
    style.right = sideOffset;
  }

  const handleScrolling: GridEventListener<'scrollPositionChange'> = () => {
    setCanScrollMore(getCanScrollMore);
  };

  useEnhancedEffect(() => {
    setCanScrollMore(getCanScrollMore);
  }, [columnsTotalWidth]);

  const resetTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const handleDragOver = useEventCallback((event: React.PointerEvent<HTMLDivElement>) => {
    let offset: number;

    if (scrollDirection === 'left') {
      offset = event.clientX - rootRef.current!.getBoundingClientRect().right;
    } else if (scrollDirection === 'right') {
      offset = Math.max(1, event.clientX - rootRef.current!.getBoundingClientRect().left);
    } else {
      throw new Error('MUI X: Wrong drag direction');
    }

    offset = (offset - CLIFF) * SLOP + CLIFF;

    if (rootRef.current) {
      rootRef.current.style.pointerEvents = 'none';
      rootRef.current.addEventListener(
        'pointerleave',
        () => {
          if (rootRef.current) {
            rootRef.current.style.pointerEvents = '';
          }
        },
        { once: true },
      );
    }

    // Avoid freeze and inertia.
    timeout.start(0, () => {
      apiRef.current.scroll({
        left: scrollPosition.current.left + offset,
        top: scrollPosition.current.top,
      });
    });
  });

  useGridApiEventHandler(apiRef, 'scrollPositionChange', handleScrolling);

  if (!canScrollMore) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className={clsx(
        'flex absolute inset-y-0 z-101 w-[25px]',
        scrollDirection === 'left' ? 'left-0' : 'right-0',
      )}
      onPointerEnter={handleDragOver}
      style={style}
    />
  );
}

export const GridScrollArea = fastMemo(GridScrollAreaWrapper);
