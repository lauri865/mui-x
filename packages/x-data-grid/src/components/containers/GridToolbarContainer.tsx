import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import PropTypes from 'prop-types';
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

GridToolbarContainer.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
} as any;

export { GridToolbarContainer };
