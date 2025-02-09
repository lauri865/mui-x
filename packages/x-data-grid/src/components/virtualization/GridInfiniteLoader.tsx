import * as React from 'react';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { GridRowId } from '../../models/gridRows';
import { gridDimensionsSelector } from '../../hooks/features/dimensions';
import { gridVisibleColumnDefinitionsSelector } from '../../hooks/features/columns';
import { useGridPrivateApiContext } from '../../hooks/utils/useGridPrivateApiContext';
import { getVisibleRows } from '../../hooks/utils/useGridVisibleRows';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';
import { unstable_useEventCallback } from '@mui/utils';
import { GridSkeletonLoadingOverlay, SkeletonRow } from '../GridSkeletonLoadingOverlay';

export type InfiniteLoaderPayload = {
  viewportPageSize: number;
  visibleRowsCount: number;
  visibleColumns: any[];
  lastRowId?: GridRowId;
};

interface InfiniteLoaderProps {
  lastRowId?: GridRowId;
  onRowsScrollEnd: NonNullable<DataGridProcessedProps['onRowsScrollEnd']>;
  margin?: number;
  skeletonRowProps?: React.ComponentProps<typeof SkeletonRow>;
  empty?: boolean;
}

export const InfiniteLoadingOverlay = () => {
  const rootProps = useGridRootProps();
  return (
    <GridInfiniteLoader
      key="infiniteLoader-empty"
      lastRowId={-1}
      onRowsScrollEnd={rootProps.onRowsScrollEnd!}
      margin={rootProps.scrollEndThreshold}
      empty
    />
  );
};

export const GridInfiniteLoader = ({
  lastRowId,
  onRowsScrollEnd,
  margin = 100,
  skeletonRowProps,
  empty,
}: InfiniteLoaderProps) => {
  const [numberOfRows, setNumberOfRows] = React.useState<number | null>(empty ? 1 : null);
  const apiRef = useGridPrivateApiContext();
  const observerRef = React.useRef<HTMLDivElement | null>(null);

  const onRowsScrollEndCallback = unstable_useEventCallback(onRowsScrollEnd);
  React.useEffect(() => {
    if (!observerRef.current) return;

    const root = apiRef.current.virtualScrollerRef.current;
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          const dimensions = gridDimensionsSelector(apiRef.current.state);
          const viewportPageSize = Math.ceil(
            dimensions.viewportInnerSize.height / dimensions.rowHeight,
          );
          const visibleRows = getVisibleRows(apiRef);

          setNumberOfRows(1);
          try {
            const res = await onRowsScrollEndCallback({
              viewportPageSize,
              visibleRowsCount: visibleRows.rows.length,
              visibleColumns: gridVisibleColumnDefinitionsSelector(apiRef),
              lastRowId,
            });
            if (res) {
              apiRef.current.updateRows(res.map((row) => ({ ...row, _action: 'insert' })));
            }
          } catch (err) {
          } finally {
            setNumberOfRows(null);
          }
        }
      },
      { root, rootMargin: `${margin}px`, threshold: 0.1 },
    );

    const element = observerRef.current;
    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [setNumberOfRows, lastRowId, onRowsScrollEndCallback, margin]);

  return (
    <div ref={observerRef} role="presentation">
      {!empty &&
        numberOfRows &&
        skeletonRowProps &&
        Array.from({ length: numberOfRows }, (_, i) => (
          <SkeletonRow {...skeletonRowProps} key={i} />
        ))}
      {empty && numberOfRows && <GridSkeletonLoadingOverlay />}
    </div>
  );
};
