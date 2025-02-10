import composeClasses from '@mui/utils/composeClasses';
import clsx from 'clsx';
import * as React from 'react';
import { getDataGridUtilityClass } from '../../constants/gridClasses';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { GridSlotsComponent } from '../../models/gridSlotsComponent';
import { GridSortDirection } from '../../models/gridSortModel';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';

export interface GridColumnHeaderSortIconProps {
  field: string;
  direction: GridSortDirection;
  index: number | undefined;
  sortingOrder: readonly GridSortDirection[];
  disabled?: boolean;
}

type OwnerState = GridColumnHeaderSortIconProps & {
  classes?: DataGridProcessedProps['classes'];
};

const useUtilityClasses = (ownerState: OwnerState) => {
  const { classes } = ownerState;

  const slots = {
    icon: ['sortIcon'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

function getIcon(
  icons: GridSlotsComponent,
  direction: GridSortDirection,
  className: string,
  sortingOrder: readonly GridSortDirection[],
) {
  let Icon;
  const iconProps: any = {};
  if (direction === 'asc') {
    Icon = icons.columnSortedAscendingIcon;
  } else if (direction === 'desc') {
    Icon = icons.columnSortedDescendingIcon;
  } else {
    Icon = icons.columnUnsortedIcon;
    iconProps.sortingOrder = sortingOrder;
  }
  return Icon ? <Icon className={className} {...iconProps} /> : null;
}

function GridColumnHeaderSortIconRaw(props: GridColumnHeaderSortIconProps) {
  const { direction, index, sortingOrder, disabled, ...other } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();

  const iconElement = getIcon(rootProps.slots, direction, '', sortingOrder);
  if (!iconElement) {
    return null;
  }

  const currentIndex = sortingOrder.indexOf(direction);
  const nextDirection = sortingOrder[(currentIndex + 1) % sortingOrder.length];
  const title =
    nextDirection === 'asc'
      ? apiRef.current.getLocaleText('columnMenuSortAsc')
      : nextDirection === 'desc'
        ? apiRef.current.getLocaleText('columnMenuSortDesc')
        : apiRef.current.getLocaleText('columnMenuUnsort');

  const iconButton = (
    <rootProps.slots.baseTooltip title={title as string}>
      <rootProps.slots.baseIconButton
        tabIndex={-1}
        aria-label={apiRef.current.getLocaleText('columnHeaderSortIconLabel')}
        size="icon"
        disabled={disabled}
        className={clsx(
          'hidden group-hover/cell:flex data-sort:flex data-sort:bg-highlight data-sort:text-highlight-text data-sort:border-highlight-border [&_svg]:!size-3.5',
        )}
        data-sort={direction || undefined}
        {...rootProps.slotProps?.baseIconButton}
        {...other}
      >
        {iconElement}
      </rootProps.slots.baseIconButton>
    </rootProps.slots.baseTooltip>
  );

  return <React.Fragment>{iconButton}</React.Fragment>;
}

const GridColumnHeaderSortIcon = React.memo(GridColumnHeaderSortIconRaw);

export { GridColumnHeaderSortIcon };
