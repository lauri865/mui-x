import * as React from 'react';
import { unstable_useId as useId } from '@mui/utils';
import { useTimeout } from '../../../hooks/utils/useTimeout';
import { TextFieldProps } from '../../../models/gridBaseSlots';
import { GridFilterItem } from '../../../models/gridFilterItem';
import { GridFilterInputValueProps } from '../../../models/gridFilterInputComponent';
import { useGridRootProps } from '../../../hooks/utils/useGridRootProps';

export type GridTypeFilterInputValueProps = GridFilterInputValueProps<TextFieldProps> & {
  type?: 'text' | 'number' | 'date' | 'datetime-local';
};

type ItemPlusTag = GridFilterItem & { fromInput?: string };

function GridFilterInputValue(props: GridTypeFilterInputValueProps) {
  const {
    item,
    applyValue,
    type,
    apiRef,
    focusElementRef,
    tabIndex,
    disabled,
    isFilterActive,
    slotProps,
    clearButton,
    headerFilterMenu,
    ...others
  } = props;
  const textFieldProps = slotProps?.root;

  const filterTimeout = useTimeout();
  const [filterValueState, setFilterValueState] = React.useState<string | undefined>(
    sanitizeFilterItemValue(item.value),
  );
  const [applying, setIsApplying] = React.useState(false);
  const id = useId();
  const rootProps = useGridRootProps();

  const onFilterChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = sanitizeFilterItemValue(event.target.value);

      setFilterValueState(value);
      setIsApplying(true);
      filterTimeout.start(rootProps.filterDebounceMs, () => {
        const newItem = {
          ...item,
          value: type === 'number' && !Number.isNaN(Number(value)) ? Number(value) : value,
          fromInput: id!,
        };
        applyValue(newItem);
        setIsApplying(false);
      });
    },
    [filterTimeout, rootProps.filterDebounceMs, item, type, id, applyValue],
  );

  React.useEffect(() => {
    const itemPlusTag = item as ItemPlusTag;
    if (itemPlusTag.fromInput !== id || item.value == null) {
      setFilterValueState(sanitizeFilterItemValue(item.value));
    }
  }, [id, item]);

  return (
    <React.Fragment>
      <rootProps.slots.baseTextField
        id={id}
        label={apiRef.current.getLocaleText('filterPanelInputLabel')}
        placeholder={apiRef.current.getLocaleText('filterPanelInputPlaceholder')}
        value={filterValueState ?? ''}
        onChange={onFilterChange}
        type={type || 'text'}
        disabled={disabled}
        slotProps={{
          ...textFieldProps?.slotProps,
          input: {
            endAdornment: applying ? (
              <rootProps.slots.baseInputAdornment position="end">
                <rootProps.slots.loadIcon fontSize="small" color="action" />
              </rootProps.slots.baseInputAdornment>
            ) : null,
            ...textFieldProps?.slotProps?.input,
          },
          htmlInput: {
            tabIndex,
            ...textFieldProps?.slotProps?.htmlInput,
          },
        }}
        inputRef={focusElementRef}
        {...rootProps.slotProps?.baseTextField}
        {...others}
        {...textFieldProps}
      />
      {headerFilterMenu}
      {clearButton}
    </React.Fragment>
  );
}

function sanitizeFilterItemValue(value: unknown) {
  if (value == null || value === '') {
    return undefined;
  }

  return String(value);
}

export { GridFilterInputValue };
