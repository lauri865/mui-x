import * as React from 'react';
import {
  GridColumnMenuProps,
  GRID_COLUMN_MENU_SLOTS,
  GRID_COLUMN_MENU_SLOT_PROPS,
} from '@mui/x-data-grid';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useGridRootProps } from '@mui/x-data-grid-pro';
import { GridColumnMenuPinningItem } from './GridColumnMenuPinningItem';

export const GRID_COLUMN_MENU_SLOTS_PRO = {
  ...GRID_COLUMN_MENU_SLOTS,
  columnMenuPinningItem: GridColumnMenuPinningItem,
};

export const GRID_COLUMN_MENU_SLOT_PROPS_PRO = {
  ...GRID_COLUMN_MENU_SLOT_PROPS,
  columnMenuPinningItem: {
    displayOrder: 15,
  },
};

export const GridProColumnMenu = forwardRef<HTMLUListElement, GridColumnMenuProps>(
  function GridProColumnMenu(props, ref) {
    const rootProps = useGridRootProps();
    return null;
    return (
      <GridGenericColumnMenu
        {...props}
        defaultSlots={GRID_COLUMN_MENU_SLOTS_PRO}
        defaultSlotProps={GRID_COLUMN_MENU_SLOT_PROPS_PRO}
        ref={ref}
      />
    );
  },
);
