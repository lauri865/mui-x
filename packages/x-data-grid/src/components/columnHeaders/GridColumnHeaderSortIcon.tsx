import * as React from 'react';
import PropTypes from 'prop-types';
import composeClasses from '@mui/utils/composeClasses';
import { GridSlotsComponent } from '../../models/gridSlotsComponent';
import { GridSortDirection } from '../../models/gridSortModel';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { getDataGridUtilityClass } from '../../constants/gridClasses';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';
import clsx from 'clsx';

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

  const iconElement = getIcon(rootProps.slots, direction, '!size-4', sortingOrder);
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
          'hidden group-hover/cell:flex data-sort:flex data-sort:bg-highlight data-sort:text-highlight-text data-sort:border-highlight-border border border-transparent',
        )}
        data-sort={direction || undefined}
        {...rootProps.slotProps?.baseIconButton}
        {...other}
      >
        {iconElement}
      </rootProps.slots.baseIconButton>
    </rootProps.slots.baseTooltip>
  );

  return <>{iconButton}</>;
}

const GridColumnHeaderSortIcon = React.memo(GridColumnHeaderSortIconRaw);

GridColumnHeaderSortIconRaw.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  direction: PropTypes.oneOf(['asc', 'desc']),
  disabled: PropTypes.bool,
  field: PropTypes.string.isRequired,
  index: PropTypes.number,
  sortingOrder: PropTypes.arrayOf(PropTypes.oneOf(['asc', 'desc'])).isRequired,
} as any;

export { GridColumnHeaderSortIcon };
