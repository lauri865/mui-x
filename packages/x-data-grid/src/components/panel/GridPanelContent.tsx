import clsx from 'clsx';
import PropTypes from 'prop-types';
import * as React from 'react';

function GridPanelContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...other } = props;

  return (
    <div
      className={clsx('flex flex-col overflow-auto flex-1 p-cell max-h-[400px] gap-2.5', className)}
      {...other}
    />
  );
}

GridPanelContent.propTypes = {
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

export { GridPanelContent };
