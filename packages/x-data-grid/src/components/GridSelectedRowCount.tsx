import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { useThemedComponent } from '../context/GridThemeContext';
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
    const rowSelectedText = apiRef.current.getLocaleText('footerRowSelected');
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

GridSelectedRowCount.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  selectedRowCount: PropTypes.number.isRequired,
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
} as any;

export { GridSelectedRowCount };
