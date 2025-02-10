import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import * as React from 'react';
import { useThemedComponent } from '../../context/GridThemeContext';

export type GridFooterContainerProps = React.HTMLAttributes<HTMLDivElement>;

const GridFooterContainer = forwardRef<HTMLDivElement, GridFooterContainerProps>(
  function GridFooterContainer(props, ref) {
    const { className, ...other } = props;
    const classes = useThemedComponent('footer');

    return <div className={clsx(classes.root, className)} {...other} ref={ref} />;
  },
);

export { GridFooterContainer };
