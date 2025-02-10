import clsx from 'clsx';
import * as React from 'react';
import { gridClasses } from '../../constants/gridClasses';

export function GridBottomContainer(props: React.PropsWithChildren) {
  return (
    <div
      {...props}
      className={clsx(
        'sticky z-4 bottom-[calc(var(--DataGrid-hasScrollX)*var(--DataGrid-scrollbarSize))]',
        gridClasses['container--bottom'],
      )}
      role="presentation"
    />
  );
}
