import clsx from 'clsx';
import * as React from 'react';
import { useThemedComponent } from '../../context/GridThemeContext';

export function GridTopContainer(props: React.PropsWithChildren) {
  const classes = useThemedComponent('topContainer');

  return <div {...props} className={clsx(classes.root)} role="presentation" />;
}
