import { renderEditSingleSelectCell } from '../components/cell/GridEditSingleSelectCell';
import {
  getValueOptions,
  isSingleSelectColDef,
} from '../components/panel/filterPanel/filterPanelUtils';
import { get } from '../hooks/features/columns/gridColumnsUtils';
import { GridSingleSelectColDef, ValueOptions } from '../models/colDef/gridColDef';
import { isObject } from '../utils/utils';
import { getGridSingleSelectOperators } from './gridSingleSelectOperators';
import { GRID_STRING_COL_DEF } from './gridStringColDef';

const isArrayOfObjects = (options: any): options is Array<Record<string, any>> => {
  return typeof options[0] === 'object';
};

const defaultGetOptionValue = (key: string) => (value: ValueOptions) => {
  return isObject(value) ? get(value, key) : value;
};

const defaultGetOptionLabel = (key: string) => (value: ValueOptions) => {
  return isObject(value) ? get(value, key) : String(value);
};

export const GRID_SINGLE_SELECT_COL_DEF: Omit<
  GridSingleSelectColDef,
  'field' | 'editCellParams'
> & {
  editCellParams: Pick<
    GridSingleSelectColDef['editCellParams'],
    'getOptionLabel' | 'getOptionValue'
  >;
} = {
  ...GRID_STRING_COL_DEF,
  editCell: 'singleSelect',
  editCellParams: {
    getOptionLabel: defaultGetOptionLabel('label'),
    getOptionValue: defaultGetOptionValue('value'),
  },
  valueFormatter(value, row, colDef, apiRef) {
    // const { id, field, value, api } = params;
    const rowId = apiRef.current.getRowId(row);

    if (!isSingleSelectColDef(colDef)) {
      return '';
    }

    const valueOptions = getValueOptions(colDef, { id: rowId, row });
    if (value == null) {
      return '';
    }

    if (!valueOptions) {
      return value;
    }

    if (!isArrayOfObjects(valueOptions)) {
      console.log('codef', colDef.editCellParams);
      return colDef.editCellParams.getOptionLabel!(value);
    }

    const valueOption = valueOptions.find(
      (option) => colDef.editCellParams.getOptionValue!(option) === value,
    );
    return valueOption ? colDef.editCellParams.getOptionLabel!(valueOption) : '';
  },
  renderEditCell: renderEditSingleSelectCell,
  filterOperators: getGridSingleSelectOperators(),
  // @ts-ignore
  pastedValueParser: async (value, row, column) => {
    const colDef = column as GridSingleSelectColDef;
    const valueOptions = await getValueOptions(colDef)!;
    const getOptionValue = colDef.editCellParams.getOptionValue!;
    const valueOption = valueOptions.find((option) => {
      if (getOptionValue(option) === value) {
        return true;
      }
      return false;
    });
    if (valueOption) {
      return value;
    }
    // do not paste the value if it is not in the valueOptions
    return undefined;
  },
};
