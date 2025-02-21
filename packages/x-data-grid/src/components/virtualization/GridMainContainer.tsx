import { forwardRef } from '@mui/x-internals/forwardRef';
import * as React from 'react';
import { useThemedComponent } from '../../context/GridThemeContext';
import { useGridConfiguration } from '../../hooks/utils/useGridConfiguration';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';

export const GridMainContainer = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<{
    className: string;
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
