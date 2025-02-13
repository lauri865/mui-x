import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import * as React from 'react';
import { useThemedComponent } from '../context/GridThemeContext';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';

interface SelectedRowCountProps {
  selectedRowCount: number;
}

type GridSelectedRowCountProps = React.HTMLAttributes<HTMLDivElement> & SelectedRowCountProps;

const GridSelectedRowCount = forwardRef<HTMLDivElement, GridSelectedRowCountProps>(
  function GridSelectedRowCount(props, ref) {
    const { className, selectedRowCount, ...other } = props;
    const apiRef = useGridApiContext();
    const rootProps = useGridRootProps();
    let rowSelectedText = apiRef.current.getLocaleText('footerRowSelected');
    if (typeof rowSelectedText === 'function') {
      // @ts-ignore – backwards compatibility for old locale
      rowSelectedText = rowSelectedText(selectedRowCount);
    }
    const classes = useThemedComponent('selectedRowCount');

    return (
      <rootProps.slots.baseTooltip
        title={apiRef.current.getLocaleText('toolbarQuickFilterDeleteIconLabel')}
        delay={500}
        {...rootProps.slotProps?.baseTooltip}
        side="top"
      >
        <div
          className={clsx(classes.root, className)}
          {...other}
          ref={ref}
          role="button"
          onClick={() =>
            apiRef.current.publishEvent('headerSelectionCheckboxChange', { value: false })
          }
        >
          {rowSelectedText}
          <span className={classes.variants.badge}>{selectedRowCount.toLocaleString()}</span>
        </div>
      </rootProps.slots.baseTooltip>
    );
  },
);

export { GridSelectedRowCount };
