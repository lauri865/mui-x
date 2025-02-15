import { useGridRootProps } from '../../../../hooks/utils/useGridRootProps';
import { useGridPrivateApiContext } from '../../../../internals';
import { GridColumnMenuItemProps } from '../GridColumnMenuItemProps';

function GridColumnAggregationItem(props: GridColumnMenuItemProps & { returnOptions?: boolean }) {
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

  if (!availableAggregations.length) {
    return null;
  }

  const currentAggregation = apiRef.current.getColumnAggregation(colDef.field);
  const options = (
    <DropdownMenu.RadioGroup value={currentAggregation?.aggregation}>
      {currentAggregation && (
        <DropdownMenu.RadioItem
          key="none"
          onSelect={() => {
            apiRef.current.setColumnAggregation(colDef.field, '');
          }}
          value="none"
        >
          None
        </DropdownMenu.RadioItem>
      )}
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
  );

  if (props.returnOptions) {
    return options;
  }

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        <rootProps.slots.aggregationIcon />
        {apiRef.current.getLocaleText('aggregationMenuItemHeader')}
      </DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent>{options}</DropdownMenu.SubContent>
    </DropdownMenu.Sub>
  );
}

export { GridColumnAggregationItem };
