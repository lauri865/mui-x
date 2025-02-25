import * as React from 'react';
import { useGridPrivateApiContext } from '../../../../hooks/utils/useGridPrivateApiContext';
import { useGridRootProps } from '../../../../hooks/utils/useGridRootProps';
import { GridPrivateApiCommon } from '../../../../models/api/gridApiCommon';
import { GridColDef } from '../../../../models/colDef/gridColDef';
import { GridColumnMenuItemProps } from '../GridColumnMenuItemProps';

export function getAvailableAggregations(
  colDef: GridColDef,
  apiRef: React.RefObject<GridPrivateApiCommon>,
): string[] {
  const aggregationFunctions = apiRef.current.aggregationFunctions;
  const aggregationFunctionMethods = Object.keys(aggregationFunctions);

  return colDef.aggregationFunctions
    ? aggregationFunctionMethods.filter((fn) => colDef.aggregationFunctions!.includes(fn))
    : Object.entries(aggregationFunctions).reduce((acc, [name, fn]) => {
        if (fn.columnTypes?.includes(colDef.type!)) {
          acc.push(name);
        }
        return acc;
      }, [] as string[]);
}

export function AggregationMenuOptions({
  field,
  availableAggregations,
}: {
  field: string;
  availableAggregations: string[];
}) {
  const apiRef = useGridPrivateApiContext();
  const rootProps = useGridRootProps();
  const DropdownMenu = rootProps.slots.baseDropdownMenu;

  const aggregationFunctions = apiRef.current.aggregationFunctions;
  const currentAggregation = apiRef.current.getColumnAggregation(field);

  return (
    <DropdownMenu.RadioGroup value={currentAggregation?.aggregation}>
      {currentAggregation && (
        <DropdownMenu.RadioItem
          key="none"
          onSelect={() => {
            apiRef.current.setColumnAggregation(field, '');
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
            apiRef.current.setColumnAggregation(field, aggregation);
          }}
          value={aggregation}
        >
          {aggregationFunctions[aggregation].label}
        </DropdownMenu.RadioItem>
      ))}
    </DropdownMenu.RadioGroup>
  );
}

function GridColumnAggregationItem(props: GridColumnMenuItemProps & { returnOptions?: boolean }) {
  const { colDef } = props;
  const apiRef = useGridPrivateApiContext();
  const rootProps = useGridRootProps();

  if (!colDef.aggregable) {
    return;
  }

  const DropdownMenu = rootProps.slots.baseDropdownMenu;

  const aggregationFunctions = apiRef.current.aggregationFunctions;
  const availableAggregations = getAvailableAggregations(colDef, apiRef);

  if (!availableAggregations.length) {
    return null;
  }

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        <rootProps.slots.aggregationIcon />
        {apiRef.current.getLocaleText('aggregationMenuItemHeader')}
      </DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent>
        <AggregationMenuOptions
          field={colDef.field}
          availableAggregations={availableAggregations}
        />
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
  );
}

export { GridColumnAggregationItem };
