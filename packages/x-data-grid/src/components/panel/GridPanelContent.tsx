import clsx from 'clsx';
import * as React from 'react';

function GridPanelContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...other } = props;

  return (
    <div
      className={clsx('flex flex-col overflow-auto flex-1 p-cell max-h-[400px] gap-2.5', className)}
      {...other}
    />
  );
}

export { GridPanelContent };
