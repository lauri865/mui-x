import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import * as React from 'react';
import { useThemedComponent } from '../context/GridThemeContext';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';

interface RowCountProps {
  rowCount: number;
  visibleRowCount: number;
}

export type GridRowCountProps = React.HTMLAttributes<HTMLDivElement> & RowCountProps;

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

export { GridRowCount };
