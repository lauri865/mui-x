import type { GridColDef, GridSingleSelectColDef } from '../../../models/colDef/gridColDef';
import type { GridValueOptionsParams } from '../../../models/params/gridValueOptionsParams';

export function isSingleSelectColDef(colDef: GridColDef | null): colDef is GridSingleSelectColDef {
  return colDef !== null && 'editCell' in colDef && colDef.editCell === 'singleSelect';
}

export function getValueOptions(
  column: GridSingleSelectColDef,
  additionalParams?: Omit<GridValueOptionsParams, 'field'>,
) {
  if (!column) {
    return undefined;
  }
  return typeof column.editCellParams.valueOptions === 'function'
    ? column.editCellParams.valueOptions({ field: column.field, ...additionalParams })
    : column.editCellParams.valueOptions;
}

export function getValueFromValueOptions(
  value: string,
  valueOptions: any[] | undefined,
  getOptionValue: NonNullable<GridSingleSelectColDef['editCellParams']['getOptionValue']>,
) {
  if (valueOptions === undefined) {
    return undefined;
  }
  const result = valueOptions.find((option) => {
    const optionValue = getOptionValue(option);
    return String(optionValue) === String(value);
  });
  return getOptionValue(result);
}
