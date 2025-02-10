import * as React from 'react';

function GridPanelFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...other } = props;

  return (
    <div className={'flex justify-between border-t border-t-grid-border px-cell py-1'} {...other} />
  );
}

export { GridPanelFooter };
