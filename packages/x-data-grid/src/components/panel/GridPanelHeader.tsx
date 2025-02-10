import clsx from 'clsx';
import * as React from 'react';

function GridPanelHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...other } = props;

  return <div className={clsx(className)} {...other} />;
}

export { GridPanelHeader };
