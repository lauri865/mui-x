import * as React from 'react';
import clsx from 'clsx';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { useThemedComponent } from '@mui/x-data-grid/context/GridThemeContext';

interface GridBaseColumnHeadersProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GridBaseColumnHeaders = forwardRef<HTMLDivElement, GridBaseColumnHeadersProps>(
  function GridColumnHeaders(props, ref) {
    const { className, ...other } = props;
    const classes = useThemedComponent('columnHeaders');

    return (
      <div className={clsx(classes.root, className)} {...other} role="presentation" ref={ref} />
    );
  },
);
