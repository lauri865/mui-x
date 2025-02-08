import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useThemedComponent } from '../../context/GridThemeContext';

export type GridFooterContainerProps = React.HTMLAttributes<HTMLDivElement>;

const GridFooterContainer = forwardRef<HTMLDivElement, GridFooterContainerProps>(
  function GridFooterContainer(props, ref) {
    const { className, ...other } = props;
    const classes = useThemedComponent('footer');

    return <div className={clsx(classes.root, className)} {...other} ref={ref} />;
  },
);

GridFooterContainer.propTypes = {
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

export { GridFooterContainer };
