import { unstable_useId as useId } from '@mui/utils';
import * as React from 'react';
import { useGridRootProps } from '../../../hooks/utils/useGridRootProps';
import { GridSingleSelectColDef } from '../../../models/colDef/gridColDef';
import { TextFieldProps } from '../../../models/gridBaseSlots';
import { GridFilterInputValueProps } from '../../../models/gridFilterInputComponent';
import type { GridSlotsComponentsProps } from '../../../models/gridSlotsComponentsProps';
import {
  getValueFromValueOptions,
  getValueOptions,
  isSingleSelectColDef,
} from './filterPanelUtils';

const renderSingleSelectOptions = ({
  column,
  OptionComponent,
  getOptionLabel,
  getOptionValue,
  isSelectNative,
  baseSelectOptionProps,
}: {
  column: GridSingleSelectColDef;
  OptionComponent: React.ElementType;
  getOptionLabel: NonNullable<GridSingleSelectColDef['editCellParams']['getOptionLabel']>;
  getOptionValue: NonNullable<GridSingleSelectColDef['editCellParams']['getOptionValue']>;
  isSelectNative: boolean;
  baseSelectOptionProps: GridSlotsComponentsProps['baseSelectOption'];
}) => {
  const iterableColumnValues = ['', ...(getValueOptions(column) || [])];

  return iterableColumnValues.map((option) => {
    const value = getOptionValue(option);
    let label = getOptionLabel(option);
    if (label === '') {
      label = ' '; // To force the height of the empty option
    }

    return (
      <OptionComponent {...baseSelectOptionProps} native={isSelectNative} key={value} value={value}>
        {label}
      </OptionComponent>
    );
  });
};

export type GridFilterInputSingleSelectProps = GridFilterInputValueProps<TextFieldProps> & {
  type?: 'singleSelect';
};

function GridFilterInputSingleSelect(props: GridFilterInputSingleSelectProps) {
  const {
    item,
    filter,
    applyValue,
    type,
    apiRef,
    focusElementRef,
    tabIndex,
    isFilterActive,
    clearButton,
    headerFilterMenu,
    slotProps,
    ...others
  } = props;
  const filterValue = item.value ?? '';
  const id = useId();
  const labelId = useId();
  const rootProps = useGridRootProps();

  const isSelectNative = false;

  let resolvedColumn: GridSingleSelectColDef | null = null;
  if (filter.field) {
    const column = apiRef.current.getColumn(filter.field);
    if (isSingleSelectColDef(column)) {
      resolvedColumn = column;
    }
  }

  const getOptionValue = resolvedColumn?.editCellParams.getOptionValue!;
  const getOptionLabel = resolvedColumn?.editCellParams.getOptionLabel!;

  const currentValueOptions = React.useMemo(() => {
    return getValueOptions(resolvedColumn!);
  }, [resolvedColumn]);

  const onFilterChange = React.useCallback(
    (event: Event) => {
      let value = event.target.value;

      // NativeSelect casts the value to a string.
      value = getValueFromValueOptions(value, currentValueOptions, getOptionValue);
      applyValue({ ...item, value });
    },
    [currentValueOptions, getOptionValue, applyValue, item],
  );

  if (!isSingleSelectColDef(resolvedColumn)) {
    return null;
  }

  const label = slotProps?.root.label ?? apiRef.current.getLocaleText('filterPanelInputLabel');

  return (
    <React.Fragment>
      <rootProps.slots.baseInputLabel
        {...rootProps.slotProps?.baseInputLabel}
        id={labelId}
        htmlFor={id}
        shrink
        variant="outlined"
      >
        {label}
      </rootProps.slots.baseInputLabel>
      <rootProps.slots.baseSelect
        id={id}
        label={label}
        labelId={labelId}
        value={filterValue}
        onChange={onFilterChange}
        variant="outlined"
        type={type || 'text'}
        inputProps={{
          tabIndex,
          ref: focusElementRef,
          placeholder:
            slotProps?.root.placeholder ??
            apiRef.current.getLocaleText('filterPanelInputPlaceholder'),
          ...slotProps?.root.slotProps?.htmlInput,
        }}
        native={isSelectNative}
        notched
        {...rootProps.slotProps?.baseSelect}
        {
          ...(others as any) /* FIXME: typing error */
        }
        {...slotProps?.root}
      >
        {renderSingleSelectOptions({
          column: resolvedColumn,
          OptionComponent: rootProps.slots.baseSelectOption,
          getOptionLabel,
          getOptionValue,
          isSelectNative,
          baseSelectOptionProps: rootProps.slotProps?.baseSelectOption,
        })}
      </rootProps.slots.baseSelect>
      {headerFilterMenu}
      {clearButton}
    </React.Fragment>
  );
}

export { GridFilterInputSingleSelect };
