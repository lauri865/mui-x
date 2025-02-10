import * as React from 'react';
import { useGridApiContext } from '../../../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../../../hooks/utils/useGridRootProps';
import { GridColumnMenuItemProps } from '../GridColumnMenuItemProps';

function GridColumnMenuFilterItem(props: GridColumnMenuItemProps) {
  const { colDef, onClick } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();

  const showFilter = React.useCallback(
    (event: Event) => {
      apiRef.current.showFilterPanel(colDef.field);
    },
    [apiRef, colDef.field, onClick],
  );

  if (rootProps.disableColumnFilter || !colDef.filterable) {
    return null;
  }

  const DropdownMenu = rootProps.slots.baseDropdownMenu;

  return (
    <DropdownMenu.Item onSelect={showFilter}>
      <rootProps.slots.columnMenuFilterIcon />
      {apiRef.current.getLocaleText('columnMenuFilter')}
    </DropdownMenu.Item>
  );
}

export { GridColumnMenuFilterItem };
