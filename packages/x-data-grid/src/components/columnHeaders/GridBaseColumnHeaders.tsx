import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import * as React from 'react';
import { useThemedComponent } from '../../context/GridThemeContext';

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
