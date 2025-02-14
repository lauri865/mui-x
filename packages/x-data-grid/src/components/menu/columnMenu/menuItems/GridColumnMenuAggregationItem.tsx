import { useGridRootProps } from '../../../../hooks/utils/useGridRootProps';
import { useGridPrivateApiContext } from '../../../../internals';
import { GridColumnMenuItemProps } from '../GridColumnMenuItemProps';

function GridColumnAggregationItem(props: GridColumnMenuItemProps) {
  const { colDef } = props;
  const apiRef = useGridPrivateApiContext();
  const rootProps = useGridRootProps();

  if (!colDef.aggregable) {
    return;
  }

  const DropdownMenu = rootProps.slots.baseDropdownMenu;

  const aggregationFunctions = apiRef.current.aggregationFunctions;
  const aggregationFunctionMethods = Object.keys(aggregationFunctions);

  const availableAggregations = colDef.availableAggregationFunctions
    ? aggregationFunctionMethods.filter((fn) => colDef.availableAggregationFunctions!.includes(fn))
    : Object.entries(aggregationFunctions).reduce((acc, [name, fn]) => {
        if (fn.columnTypes?.includes(colDef.type!)) {
          acc.push(name);
        }
        return acc;
      }, [] as string[]);

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        <rootProps.slots.aggregationIcon />
        {apiRef.current.getLocaleText('aggregationMenuItemHeader')}
      </DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent>
        <DropdownMenu.RadioGroup
          value={apiRef.current.getColumnAggregation(colDef.field)?.aggregation}
        >
          {availableAggregations.map((aggregation) => (
            <DropdownMenu.RadioItem
              key={aggregation}
              onSelect={() => {
                apiRef.current.setColumnAggregation(colDef.field, aggregation);
              }}
              value={aggregation}
            >
              {aggregationFunctions[aggregation].label}
            </DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
  );
}

export { GridColumnAggregationItem };
