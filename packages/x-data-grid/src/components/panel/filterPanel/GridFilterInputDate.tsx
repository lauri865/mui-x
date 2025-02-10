import * as React from 'react';
import { unstable_useId as useId } from '@mui/utils';
import { useTimeout } from '../../../hooks/utils/useTimeout';
import { GridFilterInputValueProps } from '../../../models/gridFilterInputComponent';
import { useGridRootProps } from '../../../hooks/utils/useGridRootProps';
import { GridFilterItem } from '../../../models/gridFilterItem';
import { TextFieldProps } from '../../../models/gridBaseSlots';

export type GridFilterInputDateProps = GridFilterInputValueProps<TextFieldProps> & {
  type?: 'date' | 'datetime-local';
};

function convertFilterItemValueToInputValue(
  itemValue: GridFilterItem['value'],
  inputType: GridFilterInputDateProps['type'],
) {
  if (itemValue == null) {
    return '';
  }
  const dateCopy = new Date(itemValue);
  if (Number.isNaN(dateCopy.getTime())) {
    return '';
  }
  if (inputType === 'date') {
    return dateCopy.toISOString().substring(0, 10);
  }
  if (inputType === 'datetime-local') {
    // The date picker expects the date to be in the local timezone.
    // But .toISOString() converts it to UTC with zero offset.
    // So we need to subtract the timezone offset.
    dateCopy.setMinutes(dateCopy.getMinutes() - dateCopy.getTimezoneOffset());
    return dateCopy.toISOString().substring(0, 19);
  }
  return dateCopy.toISOString().substring(0, 10);
}

function GridFilterInputDate(props: GridFilterInputDateProps) {
  const {
    item,
    applyValue,
    type,
    apiRef,
    focusElementRef,
    slotProps,
    isFilterActive,
    headerFilterMenu,
    clearButton,
    tabIndex,
    disabled,
    ...other
  } = props;
  const rootSlotProps = slotProps?.root.slotProps;
  const filterTimeout = useTimeout();
  const [filterValueState, setFilterValueState] = React.useState(() =>
    convertFilterItemValueToInputValue(item.value, type),
  );
  const [applying, setIsApplying] = React.useState(false);
  const id = useId();
  const rootProps = useGridRootProps();

  const onFilterChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      filterTimeout.clear();
      const value = event.target.value;
      setFilterValueState(value);

      setIsApplying(true);
      filterTimeout.start(rootProps.filterDebounceMs, () => {
        const date = new Date(value);
        applyValue({ ...item, value: Number.isNaN(date.getTime()) ? undefined : date });
        setIsApplying(false);
      });
    },
    [applyValue, item, rootProps.filterDebounceMs, filterTimeout],
  );

  React.useEffect(() => {
    const value = convertFilterItemValueToInputValue(item.value, type);
    setFilterValueState(value);
  }, [item.value, type]);

  return (
    <React.Fragment>
      <rootProps.slots.baseTextField
        fullWidth
        id={id}
        label={apiRef.current.getLocaleText('filterPanelInputLabel')}
        placeholder={apiRef.current.getLocaleText('filterPanelInputPlaceholder')}
        value={filterValueState}
        onChange={onFilterChange}
        type={type || 'text'}
        disabled={disabled}
        inputRef={focusElementRef}
        slotProps={{
          ...rootSlotProps,
          input: {
            endAdornment: applying ? (
              <rootProps.slots.loadIcon fontSize="small" color="action" />
            ) : null,
            ...rootSlotProps?.input,
          },
          htmlInput: {
            max: type === 'datetime-local' ? '9999-12-31T23:59' : '9999-12-31',
            tabIndex,
            ...rootSlotProps?.htmlInput,
          },
        }}
        {...rootProps.slotProps?.baseTextField}
        {...other}
        {...slotProps?.root}
      />
      {headerFilterMenu}
      {clearButton}
    </React.Fragment>
  );
}

export { GridFilterInputDate };
