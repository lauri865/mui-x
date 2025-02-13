import { GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD } from '../../../../colDef';
import { gridFilteredRowGroupingModel } from '../../../../hooks/features/rowGrouping/rowGroupingSelector';
import { useGridApiContext } from '../../../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../../../hooks/utils/useGridRootProps';
import { GridColumnMenuItemProps } from '../GridColumnMenuItemProps';

function GridColumnRowGroupingItem(props: GridColumnMenuItemProps) {
  const { colDef } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();

  const isGroupingColumn = colDef.field === GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD;

  const DropdownMenu = rootProps.slots.baseDropdownMenu;

  if (isGroupingColumn) {
    const groupingFields = gridFilteredRowGroupingModel(apiRef.current.state).map((field) => ({
      field,
      headerName: apiRef.current.getColumn(field).headerName ?? field,
    }));
    return (
      <>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>
            <rootProps.slots.groupExpandIcon />
            {apiRef.current.getLocaleText('groupExpansion')}
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item onSelect={() => apiRef.current.setDefaultGroupingExpansionDepth(0)}>
              {apiRef.current.getLocaleText('groupCollapseAll')}
            </DropdownMenu.Item>
            {groupingFields.map(
              ({ field, headerName }, i) =>
                i < groupingFields.length - 1 && (
                  <DropdownMenu.Item
                    key={field}
                    onClick={() => apiRef.current.setDefaultGroupingExpansionDepth(i + 1)}
                  >
                    {apiRef.current.getLocaleText('groupExpandColumn')(headerName)}
                  </DropdownMenu.Item>
                ),
            )}
            <DropdownMenu.Item onSelect={() => apiRef.current.setDefaultGroupingExpansionDepth(-1)}>
              {apiRef.current.getLocaleText('groupExpandAll')}
            </DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        {groupingFields.map(({ field, headerName }) => (
          <DropdownMenu.Item
            key={field}
            onClick={() => apiRef.current.removeRowGroupingCriteria(field)}
          >
            <rootProps.slots.ungroupIcon />
            {apiRef.current.getLocaleText('unGroupColumn')(headerName)}
          </DropdownMenu.Item>
        ))}
        <DropdownMenu.Item onClick={() => apiRef.current.setRowGroupingModel([])}>
          <rootProps.slots.ungroupIcon />
          {apiRef.current.getLocaleText('unGroupAll')}
        </DropdownMenu.Item>
      </>
    );
  }

  if (!colDef.groupable) {
    return null;
  }

  return (
    <DropdownMenu.Item onClick={() => apiRef.current.addRowGroupingCriteria(colDef.field)}>
      <rootProps.slots.groupIcon />
      {apiRef.current.getLocaleText('groupColumn')(colDef.headerName || colDef.field)}
    </DropdownMenu.Item>
  );
}

export { GridColumnRowGroupingItem };
