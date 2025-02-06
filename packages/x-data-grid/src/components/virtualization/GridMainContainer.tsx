import * as React from 'react';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useThemedComponent } from '../../context/GridThemeContext';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { useGridConfiguration } from '../../hooks/utils/useGridConfiguration';
import { GridLoadingOverlayVariant } from '../GridLoadingOverlay';

type OwnerState = Pick<DataGridProcessedProps, 'classes'> & {
  hasScrollX: boolean;
  hasPinnedRight: boolean;
  loadingOverlayVariant: GridLoadingOverlayVariant | null;
};

export const GridMainContainer = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<{
    className: string;
    ownerState: OwnerState;
  }>
>((props, ref) => {
  const rootProps = useGridRootProps();
  const configuration = useGridConfiguration();
  const ariaAttributes = configuration.hooks.useGridAriaAttributes();
  const classes = useThemedComponent('panelAnchor');

  return (
    <div
      className={props.className}
      tabIndex={-1}
      {...ariaAttributes}
      {...rootProps.slotProps?.main}
      ref={ref}
    >
      <div className={classes.root} role="presentation" data-id="gridPanelAnchor" />
      {props.children}
    </div>
  );
});
