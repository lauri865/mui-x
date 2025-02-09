import * as React from 'react';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { GridRowId } from '../../models/gridRows';
import { gridDimensionsSelector } from '../../hooks/features/dimensions';
import { gridVisibleColumnDefinitionsSelector } from '../../hooks/features/columns';
import { useGridPrivateApiContext } from '../../hooks/utils/useGridPrivateApiContext';
import { getVisibleRows } from '../../hooks/utils/useGridVisibleRows';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';
import { unstable_useEventCallback } from '@mui/utils';

export type InfiniteLoaderPayload = {
  viewportPageSize: number;
  visibleRowsCount: number;
  visibleColumns: any[];
  lastRowId: GridRowId;
};

interface InfiniteLoaderProps {
  lastRowId: GridRowId;
  onRowsScrollEnd: NonNullable<DataGridProcessedProps['onRowsScrollEnd']>;
  margin?: number;
}

export const GridInfiniteLoader = ({
  lastRowId,
  onRowsScrollEnd,
  margin = 100,
}: InfiniteLoaderProps) => {
  const [isEnabled, setIsEnabled] = React.useState(true);
  const apiRef = useGridPrivateApiContext();
  const observerRef = React.useRef<HTMLDivElement | null>(null);

  const onRowsScrollEndCallback = unstable_useEventCallback(onRowsScrollEnd);
  React.useEffect(() => {
    if (!observerRef.current || !isEnabled) return;

    const root = apiRef.current.virtualScrollerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const dimensions = gridDimensionsSelector(apiRef.current.state);
          const viewportPageSize = Math.ceil(
            dimensions.viewportInnerSize.height / dimensions.rowHeight,
          );
          const visibleRows = getVisibleRows(apiRef);
          onRowsScrollEndCallback({
            viewportPageSize,
            visibleRowsCount: visibleRows.rows.length,
            visibleColumns: gridVisibleColumnDefinitionsSelector(apiRef),
            lastRowId,
          });
          setIsEnabled(false);
        }
      },
      { root, rootMargin: `${margin}px`, threshold: 0.1 },
    );

    const element = observerRef.current;
    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [isEnabled, setIsEnabled, lastRowId, onRowsScrollEndCallback, margin]);

  return (
    <div ref={observerRef} role="presentation" className="bg-red-500">
      Load more...
    </div>
  );
};
