'use client';

import { unstable_useEventCallback } from '@mui/utils';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { gridVisibleColumnDefinitionsSelector } from '../../hooks/features/columns';
import { InfiniteLoaderOnRowsScrollEnd } from '../../hooks/features/dataLoading/gridInfiniteLoaderInterfaces';
import { gridDimensionsSelector } from '../../hooks/features/dimensions/gridDimensionsSelectors';
import { useGridPrivateApiContext } from '../../hooks/utils/useGridPrivateApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { getVisibleRows } from '../../hooks/utils/useGridVisibleRows';
import { GridRowId } from '../../models/gridRows';
import { GridSkeletonLoadingOverlay, SkeletonRow } from '../GridSkeletonLoadingOverlay';

interface InfiniteLoaderProps {
  lastRowId?: GridRowId;
  onRowsScrollEnd: InfiniteLoaderOnRowsScrollEnd;
  margin?: number;
  skeletonRowProps?: React.ComponentProps<typeof SkeletonRow>;
  empty?: boolean;
}

export function InfiniteLoadingOverlay() {
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
}

export function GridInfiniteLoader({
  lastRowId,
  onRowsScrollEnd,
  margin = 100,
  skeletonRowProps,
  empty,
}: InfiniteLoaderProps) {
  const [skeletonRowCount, setSkeletonRowCount] = React.useState<number | null>(empty ? 1 : null);
  const apiRef = useGridPrivateApiContext();
  const observerRef = React.useRef<HTMLDivElement | null>(null);

  const onRowsScrollEndCallback = unstable_useEventCallback(onRowsScrollEnd);
  React.useEffect(() => {
    if (!observerRef.current) {
      return;
    }

    const root = apiRef.current.virtualScrollerRef.current;
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          const dimensions = gridDimensionsSelector(apiRef.current.state);
          const viewportPageSize = Math.ceil(
            dimensions.viewportInnerSize.height / dimensions.rowHeight,
          );
          const visibleRows = getVisibleRows(apiRef);

          setSkeletonRowCount(1);
          try {
            const res = await onRowsScrollEndCallback(
              {
                viewportPageSize,
                visibleRowsCount: visibleRows.rows.length,
                visibleColumns: gridVisibleColumnDefinitionsSelector(apiRef),
                lastRowId,
              },
              {
                setSkeletonRowCount,
              },
            );
            if (res) {
              ReactDOM.flushSync(() => {
                setSkeletonRowCount(null);
                apiRef.current.updateRows(res.map((row) => ({ ...row, _action: 'insert' })));
              });

              // hack to trigger the scrollPosition to update with the new rows / dimensions
              requestAnimationFrame(() => {
                if (apiRef.current.virtualScrollerRef.current) {
                  apiRef.current.virtualScrollerRef.current.dispatchEvent(
                    new CustomEvent('scroll'),
                  );
                }
              });
            }
          } catch (err) {
            // do nothing
          } finally {
            setSkeletonRowCount(null);
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
  }, [setSkeletonRowCount, lastRowId, onRowsScrollEndCallback, margin]);

  return (
    <div ref={observerRef} role="presentation">
      {!empty &&
        skeletonRowCount &&
        skeletonRowProps &&
        Array.from({ length: skeletonRowCount }, (_, i) => (
          <SkeletonRow {...skeletonRowProps} key={i} />
        ))}
      {empty && skeletonRowCount && <GridSkeletonLoadingOverlay />}
    </div>
  );
}
