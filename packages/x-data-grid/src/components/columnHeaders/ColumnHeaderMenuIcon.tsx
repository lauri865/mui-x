import { forwardRef } from '@mui/x-internals/forwardRef';
import * as React from 'react';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { GridStateColDef } from '../../models/colDef/gridColDef';

export interface ColumnHeaderMenuIconProps {
  colDef: GridStateColDef;
  columnMenuId: string;
  columnMenuButtonId: string;
  open: boolean;
}

export const ColumnHeaderMenuIcon = React.memo(
  forwardRef<HTMLButtonElement, ColumnHeaderMenuIconProps>((props, ref) => {
    const { open, columnMenuId, columnMenuButtonId } = props;
    const apiRef = useGridApiContext();
    const rootProps = useGridRootProps();

    return (
      <rootProps.slots.baseTooltip
        title={open ? null : apiRef.current.getLocaleText('columnMenuLabel')}
        delay={500}
        {...rootProps.slotProps?.baseTooltip}
      >
        <rootProps.slots.baseIconButton
          ref={ref}
          tabIndex={-1}
          aria-label={apiRef.current.getLocaleText('columnMenuLabel')}
          size="icon"
          id={columnMenuButtonId}
          variant={open ? 'primary' : undefined}
          {...rootProps.slotProps?.baseIconButton}
          onFocus={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            const isOpen = apiRef.current.state.columnMenu.open;
            if (!isOpen || apiRef.current.state.columnMenu.field !== props.colDef.field) {
              apiRef.current.showColumnMenu(props.colDef.field);
            } else {
              apiRef.current.hideColumnMenu();
            }
          }}
          data-open={open || undefined}
        >
          <rootProps.slots.columnMenuIcon />
        </rootProps.slots.baseIconButton>
      </rootProps.slots.baseTooltip>
    );
  }),
);
