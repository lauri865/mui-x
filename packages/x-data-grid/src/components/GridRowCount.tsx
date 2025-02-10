import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useThemedComponent } from '../context/GridThemeContext';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { DataGridProcessedProps } from '../models/props/DataGridProps';

interface RowCountProps {
  rowCount: number;
  visibleRowCount: number;
}

export type GridRowCountProps = React.HTMLAttributes<HTMLDivElement> & RowCountProps;

type OwnerState = DataGridProcessedProps;

const GridRowCount = forwardRef<HTMLDivElement, GridRowCountProps>(
  function GridRowCount(props, ref) {
    const { className, rowCount, visibleRowCount, ...other } = props;
    const apiRef = useGridApiContext();
    const classes = useThemedComponent('rowCount');

    if (rowCount === 0) {
      return null;
    }

    const text =
      visibleRowCount < rowCount
        ? apiRef.current.getLocaleText('footerTotalVisibleRows')(visibleRowCount, rowCount)
        : rowCount.toLocaleString();

    return (
      <div className={clsx(classes.root, className)} {...other} ref={ref}>
        {apiRef.current.getLocaleText('footerTotalRows')}
        <span className={classes.variants.badge}>{text}</span>
      </div>
    );
  },
);

GridRowCount.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  rowCount: PropTypes.number.isRequired,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  visibleRowCount: PropTypes.number.isRequired,
} as any;

export { GridRowCount };
