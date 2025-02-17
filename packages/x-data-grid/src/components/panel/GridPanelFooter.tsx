import * as React from 'react';

function GridPanelFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...other } = props;

  return (
    <div
      className={
        'flex justify-between *:flex-1 gap-1 border-t border-t-grid-border px-1 py-1 bg-grid-hover-bg/50 rounded-b-inherit'
      }
      {...other}
    />
  );
}

export { GridPanelFooter };
