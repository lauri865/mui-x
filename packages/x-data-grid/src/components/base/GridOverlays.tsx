import composeClasses from '@mui/utils/composeClasses';
import clsx from 'clsx';
import * as React from 'react';
import { getDataGridUtilityClass } from '../../constants/gridClasses';
import { gridDimensionsSelector } from '../../hooks/features/dimensions';
import { minimalContentHeight } from '../../hooks/features/rows/gridRowsUtils';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { useGridSelector } from '../../hooks/utils/useGridSelector';
import { GridSlotsComponent } from '../../models';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';
import { GridLoadingOverlayVariant } from '../GridLoadingOverlay';

export type GridOverlayType =
  | keyof Pick<
      GridSlotsComponent,
      'noRowsOverlay' | 'noResultsOverlay' | 'loadingOverlay' | 'noColumnsOverlay'
    >
  | null;

interface GridOverlaysProps {
  overlayType: GridOverlayType;
  loadingOverlayVariant: GridLoadingOverlayVariant | null;
}

type OwnerState = { classes: DataGridProcessedProps['classes'] };

const useUtilityClasses = (ownerState: OwnerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['overlayWrapper'],
    inner: ['overlayWrapperInner'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

export function GridOverlayWrapper(props: React.PropsWithChildren<GridOverlaysProps>) {
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const dimensions = useGridSelector(apiRef, gridDimensionsSelector);

  let height: React.CSSProperties['height'] = Math.max(
    dimensions.viewportOuterSize.height -
      dimensions.topContainerHeight -
      dimensions.bottomContainerHeight -
      (dimensions.hasScrollX ? dimensions.scrollbarSize : 0),
    0,
  );

  if (height === 0) {
    height = minimalContentHeight;
  }

  const classes = useUtilityClasses({ ...props, classes: rootProps.classes });

  const { loadingOverlayVariant, overlayType, ...other } = props;

  return (
    <div
      className={clsx(
        props.loadingOverlayVariant !== 'skeleton' && 'sticky left-0 w-0 h-0',
        overlayType === 'loadingOverlay'
          ? 'z-5' // Should be above pinned columns, pinned rows, and detail panel
          : 'z-5',
      )}
      style={
        props.loadingOverlayVariant !== 'skeleton'
          ? {
              top: `var(--DataGrid-headersTotalHeight)`,
              right: `${dimensions.columnsTotalWidth - dimensions.viewportOuterSize.width}px`,
            }
          : {}
      }
    >
      <div
        className={clsx(classes.inner)}
        style={{
          height,
          width: dimensions.viewportOuterSize.width,
        }}
        {...other}
      />
    </div>
  );
}
