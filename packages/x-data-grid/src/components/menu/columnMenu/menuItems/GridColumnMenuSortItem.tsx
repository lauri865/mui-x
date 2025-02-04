import * as React from 'react';
import PropTypes from 'prop-types';
import { useGridSelector } from '../../../../hooks/utils/useGridSelector';
import { gridSortModelSelector } from '../../../../hooks/features/sorting/gridSortingSelector';
import { GridSortDirection } from '../../../../models/gridSortModel';
import { useGridApiContext } from '../../../../hooks/utils/useGridApiContext';
import { GridColumnMenuItemProps } from '../GridColumnMenuItemProps';
import { useGridRootProps } from '../../../../hooks/utils/useGridRootProps';

function GridColumnMenuSortItem(props: GridColumnMenuItemProps) {
  const { colDef, onClick } = props;
  const apiRef = useGridApiContext();
  const sortModel = useGridSelector(apiRef, gridSortModelSelector);
  const rootProps = useGridRootProps();

  const sortDirection = React.useMemo(() => {
    if (!colDef) {
      return null;
    }
    const sortItem = sortModel.find((item) => item.field === colDef.field);
    return sortItem?.sort;
  }, [colDef, sortModel]);

  const sortingOrder: readonly GridSortDirection[] = colDef.sortingOrder ?? rootProps.sortingOrder;

  const onSortMenuItemClick = React.useCallback(
    (event: Event) => {
      const direction = (event.currentTarget as HTMLElement).getAttribute('data-value') || null;
      apiRef.current.sortColumn(
        colDef!.field,
        (direction === sortDirection ? null : direction) as GridSortDirection,
      );
    },
    [apiRef, colDef, onClick, sortDirection],
  );

  if (
    rootProps.disableColumnSorting ||
    !colDef ||
    !colDef.sortable ||
    !sortingOrder.some((item) => !!item)
  ) {
    return null;
  }

  const getLabel = (key: 'columnMenuSortAsc' | 'columnMenuSortDesc') => {
    const label = apiRef.current.getLocaleText(key);
    return typeof label === 'function' ? label(colDef) : label;
  };

  const DropdownMenu = rootProps.slots.baseDropdownMenu;

  return (
    <React.Fragment>
      <DropdownMenu.RadioGroup value={sortDirection as string}>
        {sortingOrder.includes('asc') ? (
          <DropdownMenu.RadioItem
            onSelect={onSortMenuItemClick}
            data-value="asc"
            value="asc"
            defaultChecked
          >
            {getLabel('columnMenuSortAsc')}
            <rootProps.slots.columnMenuSortAscendingIcon />
          </DropdownMenu.RadioItem>
        ) : null}
        {sortingOrder.includes('desc') ? (
          <DropdownMenu.RadioItem onSelect={onSortMenuItemClick} data-value="desc" value="desc">
            {getLabel('columnMenuSortDesc')}
            <rootProps.slots.columnMenuSortDescendingIcon />
          </DropdownMenu.RadioItem>
        ) : null}
        {sortingOrder.includes(null) && sortDirection != null ? (
          <DropdownMenu.RadioItem onSelect={onSortMenuItemClick} value="">
            {apiRef.current.getLocaleText('columnMenuUnsort')}
          </DropdownMenu.RadioItem>
        ) : null}
      </DropdownMenu.RadioGroup>
    </React.Fragment>
  );
}

GridColumnMenuSortItem.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  colDef: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
} as any;

export { GridColumnMenuSortItem };
