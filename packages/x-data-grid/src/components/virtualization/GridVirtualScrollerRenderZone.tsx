import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import * as React from 'react';
import { gridRowsMetaSelector } from '../../hooks/features/rows';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridApiOptionHandler } from '../../hooks/utils/useGridApiEventHandler';

const GridVirtualScrollerRenderZone = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function GridVirtualScrollerRenderZone(props, ref) {
  const { className, ...other } = props;
  const apiRef = useGridApiContext();
  const [offsetTop, setOffsetTop] = React.useState(0);
  const handleRenderContextChange = React.useCallback(
    (renderContext: any) => {
      const rowsMeta = gridRowsMetaSelector(apiRef.current.state);
      setOffsetTop(rowsMeta.positions[renderContext.firstRowIndex] ?? 0);
    },
    [setOffsetTop],
  );
  useGridApiOptionHandler(apiRef, 'renderContextChange', handleRenderContextChange);

  return (
    <div
      className={clsx('twg-virtualScrollerRenderZone', 'flex flex-col absolute', className)}
      style={{
        transform: `translate3d(0, ${offsetTop}px, 0)`,
        willChange: 'transform',
      }}
      {...other}
      ref={ref}
    />
  );
});

export { GridVirtualScrollerRenderZone };
