import * as React from 'react';
import { gridPreferencePanelStateSelector } from '../../../hooks';
import { useGridColumnMenuSlots } from '../../../hooks/features/columnMenu/useGridColumnMenuSlots';
import { useGridApiContext } from '../../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../../hooks/utils/useGridRootProps';
import { GridColumnMenuProps } from './GridColumnMenuProps';
import { GridColumnAggregationItem } from './menuItems/GridColumnMenuAggregationItem';
import { GridColumnMenuColumnPinningItem } from './menuItems/GridColumnMenuColumnPinningItem';
import { GridColumnMenuColumnsItem } from './menuItems/GridColumnMenuColumnsItem';
import { GridColumnMenuFilterItem } from './menuItems/GridColumnMenuFilterItem';
import { GridColumnRowGroupingItem } from './menuItems/GridColumnMenuRowGroupingItem';
import { GridColumnMenuSortItem } from './menuItems/GridColumnMenuSortItem';

export const GRID_COLUMN_MENU_SLOTS = {
  columnMenuSortItem: GridColumnMenuSortItem,
  columnMenuColumnPinning: GridColumnMenuColumnPinningItem,
  columnMenuRowGrouping: GridColumnRowGroupingItem,
  columnMenuFilterItem: GridColumnMenuFilterItem,
  columnMenuColumnsItem: GridColumnMenuColumnsItem,
  columnMenuAggregationItem: GridColumnAggregationItem,
};

export const GRID_COLUMN_MENU_SLOT_PROPS = {
  columnMenuSortItem: { displayOrder: 10 },
  columnMenuFilterItem: { displayOrder: 40 },
  columnMenuColumnPinning: { displayOrder: 25 },
  columnMenuRowGrouping: { displayOrder: 30 },
  columnMenuAggregationItem: { displayOrder: 50 },
  columnMenuColumnsItem: { displayOrder: 60 },
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

  React.useEffect(() => {
    if (props.open) {
      return () => {
        const isOpen = gridPreferencePanelStateSelector(apiRef.current.state);
        if (isOpen) {
          return;
        }
        const focusedEl = apiRef.current.rootElementRef?.current?.querySelector(
          '[tabindex="0"]',
        ) as HTMLElement;
        focusedEl?.focus();
      };
    }
  }, [props.open]);

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
          onInteractOutside={(event) => {
            if (event.detail.originalEvent instanceof PointerEvent) {
              const element = event.target as HTMLElement;
              const isCell = element.closest('[role="columnheader"], [role="gridcell"]');

              if (event.detail.originalEvent.button === 2 && isCell) {
                event.preventDefault();
              }
            }
            event.target?.addEventListener(
              'click',
              (event) => {
                console.log('event', event);
                event.preventDefault();
                event.stopPropagation();
              },
              { once: true },
            );
          }}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <DropdownMenu.Label className="text-[13px] text-grid-text/50 py-1">
            <rootProps.slots.columnsIcon />
            {props.colDef.headerName || props.colDef.field}
            <DropdownMenu.Shortcut>&#8984;&#9166;</DropdownMenu.Shortcut>
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

export { GridColumnMenu };
