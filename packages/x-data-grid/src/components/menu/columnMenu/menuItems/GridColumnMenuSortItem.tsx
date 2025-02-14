import * as React from 'react';
import { gridSortModelSelector } from '../../../../hooks/features/sorting/gridSortingSelector';
import { useGridApiContext } from '../../../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../../../hooks/utils/useGridRootProps';
import { useGridSelector } from '../../../../hooks/utils/useGridSelector';
import { GridSortDirection } from '../../../../models/gridSortModel';
import { GridColumnMenuItemProps } from '../GridColumnMenuItemProps';

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
      <DropdownMenu.Sub>
        <DropdownMenu.SubTrigger>
          <rootProps.slots.groupExpandIcon />
          {apiRef.current.getLocaleText('columnHeaderSortIconLabel')}
        </DropdownMenu.SubTrigger>
        <DropdownMenu.SubContent>
          {sortingOrder.includes('asc') && sortDirection !== 'asc' ? (
            <DropdownMenu.Item onSelect={onSortMenuItemClick} data-value="asc" defaultChecked>
              <rootProps.slots.columnMenuSortAscendingIcon />
              {getLabel('columnMenuSortAsc')}
            </DropdownMenu.Item>
          ) : null}
          {sortingOrder.includes('desc') && sortDirection !== 'desc' ? (
            <DropdownMenu.Item onSelect={onSortMenuItemClick} data-value="desc">
              <rootProps.slots.columnMenuSortDescendingIcon />
              {getLabel('columnMenuSortDesc')}
            </DropdownMenu.Item>
          ) : null}
          {sortingOrder.includes(null) && sortDirection != null ? (
            <DropdownMenu.Item onSelect={onSortMenuItemClick}>
              <rootProps.slots.filterPanelDeleteIcon />
              {apiRef.current.getLocaleText('columnMenuUnsort')}
            </DropdownMenu.Item>
          ) : null}
        </DropdownMenu.SubContent>
      </DropdownMenu.Sub>
    </React.Fragment>
  );
}

export { GridColumnMenuSortItem };
