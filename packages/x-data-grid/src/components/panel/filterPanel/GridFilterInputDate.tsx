import { unstable_useId as useId } from '@mui/utils';
import * as React from 'react';
import { useGridRootProps } from '../../../hooks/utils/useGridRootProps';
import { useTimeout } from '../../../hooks/utils/useTimeout';
import { TextFieldProps } from '../../../models/gridBaseSlots';
import { GridFilterInputValueProps } from '../../../models/gridFilterInputComponent';
import { GridFilterItem } from '../../../models/gridFilterItem';

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
  const filterTimeout = useTimeout({ runOnDispose: true });
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
        id={id}
        label={apiRef.current.getLocaleText('filterPanelInputLabel')}
        placeholder={apiRef.current.getLocaleText('filterPanelInputPlaceholder')}
        value={filterValueState}
        onChange={onFilterChange}
        type={type || 'text'}
        disabled={disabled}
        ref={focusElementRef}
        right={applying && <rootProps.slots.loadIcon fontSize="small" color="action" />}
        max={type === 'datetime-local' ? '9999-12-31T23:59' : '9999-12-31'}
        onFocus={(event: any) => event.target.showPicker?.()}
        tabIndex={tabIndex}
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
