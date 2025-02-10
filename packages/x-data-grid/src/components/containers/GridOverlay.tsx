import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import * as React from 'react';

export type GridOverlayProps = React.HTMLAttributes<HTMLDivElement>;

const GridOverlay = forwardRef<HTMLDivElement, GridOverlayProps>(function GridOverlay(props, ref) {
  const { className, ...other } = props;

  return (
    <div
      className={clsx(
        className,
        'w-full h-full flex items-center justify-center bg-[var(--unstable_DataGrid-overlayBackground)] self-center',
      )}
      {...other}
      ref={ref}
    />
  );
});

export { GridOverlay };
