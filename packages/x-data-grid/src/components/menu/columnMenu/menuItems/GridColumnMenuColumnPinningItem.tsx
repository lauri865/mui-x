import * as React from 'react';
import { GridPinnedColumnPosition } from '../../../../hooks/features/columns/gridColumnsInterfaces';
import { useGridApiContext } from '../../../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../../../hooks/utils/useGridRootProps';
import { GridColumnMenuItemProps } from '../GridColumnMenuItemProps';

function GridColumnMenuColumnPinningItem(props: GridColumnMenuItemProps) {
  const { colDef } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();

  const onChange = React.useCallback(
    (side: string) => {
      if (!side) {
        apiRef.current.unpinColumn(colDef.field);
      } else {
        apiRef.current.pinColumn(colDef.field, side as GridPinnedColumnPosition);
      }
    },
    [apiRef, colDef.field],
  );

  if (rootProps.disableColumnFilter || !colDef.filterable) {
    return null;
  }

  const DropdownMenu = rootProps.slots.baseDropdownMenu;

  const pinnedPosition = apiRef.current.getColumnPinnedPosition(colDef.field);

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        <rootProps.slots.pinIcon />
        {apiRef.current.getLocaleText('columnPinning')}
      </DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent>
        <DropdownMenu.RadioGroup value={pinnedPosition || ''} onValueChange={onChange}>
          {pinnedPosition !== null && (
            <DropdownMenu.RadioItem value="">
              {apiRef.current.getLocaleText('unpin')}
            </DropdownMenu.RadioItem>
          )}
          <DropdownMenu.RadioItem value={GridPinnedColumnPosition.LEFT}>
            {apiRef.current.getLocaleText('pinToLeft')}
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value={GridPinnedColumnPosition.RIGHT}>
            {apiRef.current.getLocaleText('pinToRight')}
          </DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
  );
}

export { GridColumnMenuColumnPinningItem };
