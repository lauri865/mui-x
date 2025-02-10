import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import * as React from 'react';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';

const GridVirtualScrollerContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function GridVirtualScrollerContent(props, ref) {
    const rootProps = useGridRootProps();
    const overflowedContent = !rootProps.autoHeight && props.style?.minHeight === 'auto';

    return (
      <div
        {...props}
        className={clsx(props.className)}
        data-overflowed={overflowedContent || undefined}
        ref={ref}
      />
    );
  },
);

export { GridVirtualScrollerContent };
