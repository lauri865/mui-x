import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import PropTypes from 'prop-types';
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

GridOverlay.propTypes = {
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

export { GridOverlay };
