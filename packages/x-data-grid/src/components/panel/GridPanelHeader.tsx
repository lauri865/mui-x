import clsx from 'clsx';
import PropTypes from 'prop-types';
import * as React from 'react';

function GridPanelHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...other } = props;

  return <div className={clsx(className)} {...other} />;
}

GridPanelHeader.propTypes = {
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

export { GridPanelHeader };
