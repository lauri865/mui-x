import * as React from 'react';
import PropTypes from 'prop-types';
import { useGridColumnMenuSlots } from '../../../hooks/features/columnMenu/useGridColumnMenuSlots';
import { GridColumnMenuColumnsItem } from './menuItems/GridColumnMenuColumnsItem';
import { GridColumnMenuFilterItem } from './menuItems/GridColumnMenuFilterItem';
import { GridColumnMenuSortItem } from './menuItems/GridColumnMenuSortItem';
import { GridColumnMenuProps } from './GridColumnMenuProps';
import { useGridRootProps } from '../../../hooks/utils/useGridRootProps';
import { useGridApiContext } from '../../../hooks/utils/useGridApiContext';

export const GRID_COLUMN_MENU_SLOTS = {
  columnMenuSortItem: GridColumnMenuSortItem,
  columnMenuFilterItem: GridColumnMenuFilterItem,
  columnMenuColumnsItem: GridColumnMenuColumnsItem,
};

export const GRID_COLUMN_MENU_SLOT_PROPS = {
  columnMenuSortItem: { displayOrder: 10 },
  columnMenuFilterItem: { displayOrder: 20 },
  columnMenuColumnsItem: { displayOrder: 30 },
};

function GridColumnMenu(props: GridColumnMenuProps) {
  const apiRef = useGridApiContext();
  const defaultSlots = GRID_COLUMN_MENU_SLOTS;
  const defaultSlotProps = GRID_COLUMN_MENU_SLOT_PROPS;
  const { slots, slotProps, id, labelledby, children, ...other } = props;
  const rootProps = useGridRootProps();

  const orderedSlots = useGridColumnMenuSlots({
    ...other,
    defaultSlots,
    defaultSlotProps,
    slots,
    slotProps,
  });

  const DropdownMenu = rootProps.slots.baseDropdownMenu;

  return (
    <DropdownMenu.Root
      open={props.open}
      modal={false}
      onOpenChange={(open) => {
        if (!open) {
          props.hideMenu();
        } else {
          props.showMenu();
        }
      }}
    >
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          id={id}
          aria-labelledby={labelledby}
          alignOffset={-8}
          sideOffset={10}
          collisionBoundary={apiRef.current.rootElementRef.current || undefined}
          collisionPadding={-1}
          align={
            props.colDef.headerAlign === 'right'
              ? 'start'
              : props.colDef.headerAlign === 'center'
                ? 'center'
                : 'end'
          }
          onInteractOutside={(e) => {
            e.target?.addEventListener(
              'click',
              (event) => {
                event.preventDefault();
                event.stopPropagation();
              },
              { once: true },
            );
          }}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <DropdownMenu.Label className="text-[13px] text-neutral-400 py-1">
            {props.colDef.headerName || props.colDef.field}
          </DropdownMenu.Label>
          <DropdownMenu.Separator />
          {orderedSlots.map(([Component, otherProps], index) => (
            <Component key={index} {...otherProps} />
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

GridColumnMenu.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  colDef: PropTypes.object.isRequired,
  hideMenu: PropTypes.func.isRequired,
  id: PropTypes.string,
  labelledby: PropTypes.string,
  open: PropTypes.bool.isRequired,
  /**
   * Could be used to pass new props or override props specific to a column menu component
   * e.g. `displayOrder`
   */
  slotProps: PropTypes.object,
  /**
   * `slots` could be used to add new and (or) override default column menu items
   * If you register a nee component you must pass it's `displayOrder` in `slotProps`
   * or it will be placed in the end of the list
   */
  slots: PropTypes.object,
} as any;

export { GridColumnMenu };
