import * as React from 'react';
import clsx from 'clsx';
import { useThemedComponent } from '@mui/x-data-grid/context/GridThemeContext';

export function GridTopContainer(props: React.PropsWithChildren) {
  const classes = useThemedComponent('topContainer');

  return <div {...props} className={clsx(classes.root)} role="presentation" />;
}
