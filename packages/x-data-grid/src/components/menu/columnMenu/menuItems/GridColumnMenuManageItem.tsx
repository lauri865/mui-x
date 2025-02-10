import * as React from 'react';
import { GridPreferencePanelsValue } from '../../../../hooks/features/preferencesPanel/gridPreferencePanelsValue';
import { useGridApiContext } from '../../../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../../../hooks/utils/useGridRootProps';
import { GridColumnMenuItemProps } from '../GridColumnMenuItemProps';

function GridColumnMenuManageItem(props: GridColumnMenuItemProps) {
  const { onClick } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();

  const showColumns = React.useCallback(
    (event: Event) => {
      apiRef.current.showPreferences(GridPreferencePanelsValue.columns);
    },
    [apiRef, onClick],
  );

  if (rootProps.disableColumnSelector) {
    return null;
  }

  const DropdownMenu = rootProps.slots.baseDropdownMenu;

  return (
    <DropdownMenu.Item onSelect={showColumns}>
      <rootProps.slots.columnMenuManageColumnsIcon />
      {apiRef.current.getLocaleText('columnMenuManageColumns')}
    </DropdownMenu.Item>
  );
}

export { GridColumnMenuManageItem };
