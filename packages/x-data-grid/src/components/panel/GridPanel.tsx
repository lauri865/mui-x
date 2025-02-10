import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { unstable_generateUtilityClasses as generateUtilityClasses } from '@mui/utils';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import type { DataGridProcessedProps } from '../../models/props/DataGridProps';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';

type OwnerState = DataGridProcessedProps;

export interface GridPanelClasses {
  /** Styles applied to the root element. */
  panel: string;
  /** Styles applied to the paper element. */
  paper: string;
}

export interface GridPanelProps extends Partial<React.ComponentProps<any>> {
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<GridPanelClasses>;
  open: boolean;
}

export const gridPanelClasses = generateUtilityClasses<keyof GridPanelClasses>('MuiDataGrid', [
  'panel',
  'paper',
]);

/* const GridPanelRoot = styled(Popper, {
  name: 'MuiDataGrid',
  slot: 'Panel',
  overridesResolver: (props, styles) => styles.panel,
})<{ ownerState: OwnerState }>(({ theme }) => ({
  zIndex: theme.zIndex.modal,
}));

const GridPaperRoot = styled(Paper, {
  name: 'MuiDataGrid',
  slot: 'Paper',
  overridesResolver: (props, styles) => styles.paper,
})<{ ownerState: OwnerState }>(({ theme }) => ({
  backgroundColor: (theme.vars || theme).palette.background.paper,
  minWidth: 300,
  maxHeight: 450,
  display: 'flex',
  maxWidth: `calc(100vw - ${theme.spacing(0.5)})`,
  overflow: 'auto',
})); */

const GridPanel = forwardRef<HTMLDivElement, GridPanelProps>((props, ref) => {
  const { children, className, classes: classesProp, ...other } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const classes = gridPanelClasses;
  const [isPlaced, setIsPlaced] = React.useState(false);

  const handleClickAway = React.useCallback(() => {
    apiRef.current.hidePreferences();
  }, [apiRef]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        apiRef.current.hidePreferences();
      }
    },
    [apiRef],
  );

  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

  React.useEffect(() => {
    const panelAnchor = apiRef.current.rootElementRef?.current?.querySelector(
      '[data-id="gridPanelAnchor"]',
    );

    if (panelAnchor) {
      setAnchorEl(panelAnchor);
    }
  }, [apiRef]);

  if (!anchorEl) {
    return null;
  }

  throw new Error('Not implemented');
  return null;
});

export { GridPanel };
