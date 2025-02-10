import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import * as React from 'react';

export type GridToolbarContainerProps = React.HTMLAttributes<HTMLDivElement>;

const GridToolbarContainer = forwardRef<HTMLDivElement, GridToolbarContainerProps>(
  function GridToolbarContainer(props, ref) {
    const { className, children, ...other } = props;

    if (!children) {
      return null;
    }

    return (
      <div
        className={clsx('flex items-center flex-wrap gap-2 p-1 pb-0', className)}
        {...other}
        ref={ref}
      >
        {children}
      </div>
    );
  },
);

export { GridToolbarContainer };
