import * as React from 'react';
import clsx from 'clsx';
import { styled, SxProps, Theme } from '@mui/system';
import composeClasses from '@mui/utils/composeClasses';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { gridRowsMetaSelector } from '../../hooks/features/rows';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { getDataGridUtilityClass } from '../../constants/gridClasses';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';
import { useGridApiOptionHandler } from '../../hooks/utils/useGridApiEventHandler';
import { GridEventListener } from '../../models/events';
import { gridRenderContextSelector } from '../../hooks/features/virtualization/gridVirtualizationSelectors';
import { useGridPrivateApiContext } from '../../hooks/utils/useGridPrivateApiContext';

type OwnerState = DataGridProcessedProps;

const useUtilityClasses = (ownerState: OwnerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['virtualScrollerRenderZone'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

const VirtualScrollerRenderZoneRoot = styled('div', {
  name: 'MuiDataGrid',
  slot: 'VirtualScrollerRenderZone',
  overridesResolver: (props, styles) => styles.virtualScrollerRenderZone,
})<{ ownerState: OwnerState }>({
  position: 'absolute',
  display: 'flex', // Prevents margin collapsing when using `getRowSpacing`
  flexDirection: 'column',
});

const GridVirtualScrollerRenderZone = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { sx?: SxProps<Theme> }
>(function GridVirtualScrollerRenderZone(props, ref) {
  const { className, ...other } = props;
  const apiRef = useGridPrivateApiContext();
  const rootProps = useGridRootProps();
  const classes = useUtilityClasses(rootProps);
  const [offsetTop, setOffsetTop] = React.useState(0);
  const handleRenderContextChange = React.useCallback<
    GridEventListener<'renderedRowsIntervalChange'>
  >(
    (renderContext) => {
      const rowsMeta = gridRowsMetaSelector(apiRef.current.state);
      setOffsetTop(rowsMeta.positions[renderContext.firstRowIndex] ?? 0);
    },
    [apiRef],
  );
  useGridApiOptionHandler(apiRef, 'renderedRowsIntervalChange', handleRenderContextChange);

  return (
    <VirtualScrollerRenderZoneRoot
      className={clsx(classes.root, className)}
      ownerState={rootProps}
      style={{
        transform: `translate3d(0, ${offsetTop}px, 0)`,
      }}
      {...other}
      ref={ref}
    />
  );
});

export { GridVirtualScrollerRenderZone };
