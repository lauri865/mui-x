import * as React from 'react';
import { gridVisibleColumnDefinitionsSelector } from '../../../../hooks/features/columns';
import { useGridApiContext } from '../../../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../../../hooks/utils/useGridRootProps';
import { GridColumnMenuItemProps } from '../GridColumnMenuItemProps';

function GridColumnMenuAutoSizeAllItem(props: GridColumnMenuItemProps) {
  const { colDef, onClick } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();

  const visibleColumns = gridVisibleColumnDefinitionsSelector(apiRef);
  const columnsWithMenu = visibleColumns.filter((col) => col.disableColumnMenu !== true);
  // do not allow to hide the last column with menu
  const disabled = columnsWithMenu.length === 1;

  const autosize = React.useCallback(
    (event: Event) => {
      /**
       * Disabled `MenuItem` would trigger `click` event
       * after imperative `.click()` call on HTML element.
       * Also, click is triggered in testing environment as well.
       */
      if (disabled) {
        return;
      }
      apiRef.current.autosizeColumns({
        expand: false,
      });
    },
    [apiRef, colDef.field, onClick, disabled],
  );

  if (rootProps.disableColumnSelector) {
    return null;
  }

  const DropdownMenu = rootProps.slots.baseDropdownMenu;

  return (
    <DropdownMenu.Item onSelect={autosize} disabled={disabled}>
      <rootProps.slots.autosizeIcon />
      {apiRef.current.getLocaleText('columnMenuAutoSizeAllColumns')}
    </DropdownMenu.Item>
  );
}

export { GridColumnMenuAutoSizeAllItem };
