import { unstable_useEnhancedEffect as useEnhancedEffect } from '@mui/utils';
import * as React from 'react';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { GridEditModes } from '../../models/gridEditRowModel';
import { GridRenderEditCellParams } from '../../models/params/gridCellParams';
import { GridCellEditStopReasons } from '../../models/params/gridEditCellParams';
import {
  getValueFromValueOptions,
  getValueOptions,
  isSingleSelectColDef,
} from '../panel/filterPanel/filterPanelUtils';

export interface GridEditSingleSelectCellProps extends GridRenderEditCellParams {
  /**
   * Callback called when the value is changed by the user.
   * @param {SelectChangeEvent<any>} event The event source of the callback.
   * @param {any} newValue The value that is going to be passed to `apiRef.current.setEditCellValue`.
   * @returns {Promise<void> | void} A promise to be awaited before calling `apiRef.current.setEditCellValue`
   */
  onValueChange?: (event: Event, newValue: any) => Promise<void> | void;
  /**
   * If true, the select opens by default.
   */
  initialOpen?: boolean;
}

function isKeyboardEvent(event: any): event is React.KeyboardEvent {
  return !!event.key;
}

function GridEditSingleSelectCell(props: GridEditSingleSelectCellProps) {
  const rootProps = useGridRootProps();
  const {
    id,
    value: valueProp,
    formattedValue,
    api,
    field,
    row,
    rowNode,
    colDef,
    cellMode,
    isEditable,
    tabIndex,
    className,
    hasFocus,
    isValidating,
    isProcessingProps,
    error,
    onValueChange,
    initialOpen = rootProps.editMode === GridEditModes.Cell,
    ...other
  } = props;

  const apiRef = useGridApiContext();
  const ref = React.useRef<any>(null);
  const inputRef = React.useRef<any>(null);
  const [open, setOpen] = React.useState(initialOpen);

  const baseSelectProps = rootProps.slotProps?.baseSelect || {};
  const isSelectNative = baseSelectProps.native ?? false;
  const { MenuProps, ...otherBaseSelectProps } = rootProps.slotProps?.baseSelect || {};

  useEnhancedEffect(() => {
    if (hasFocus) {
      inputRef.current?.focus();
    }
  }, [hasFocus]);

  if (!isSingleSelectColDef(colDef)) {
    return null;
  }

  const valueOptions = getValueOptions(colDef, { id, row });
  if (!valueOptions) {
    return null;
  }

  const getOptionValue = colDef.getOptionValue!;
  const getOptionLabel = colDef.getOptionLabel!;

  const handleChange: SelectProps['onChange'] = async (event) => {
    if (!isSingleSelectColDef(colDef) || !valueOptions) {
      return;
    }

    setOpen(false);
    const target = event.target as HTMLInputElement;
    // NativeSelect casts the value to a string.
    const formattedTargetValue = getValueFromValueOptions(
      target.value,
      valueOptions,
      getOptionValue,
    );

    if (onValueChange) {
      await onValueChange(event, formattedTargetValue);
    }

    await apiRef.current.setEditCellValue({ id, field, value: formattedTargetValue }, event);
  };

  const handleClose = (event: React.KeyboardEvent, reason: string) => {
    if (rootProps.editMode === GridEditModes.Row) {
      setOpen(false);
      return;
    }
    if (reason === 'backdropClick' || event.key === 'Escape') {
      const params = apiRef.current.getCellParams(id, field);
      apiRef.current.publishEvent('cellEditStop', {
        ...params,
        reason:
          event.key === 'Escape'
            ? GridCellEditStopReasons.escapeKeyDown
            : GridCellEditStopReasons.cellFocusOut,
      });
    }
  };

  const handleOpen: SelectProps['onOpen'] = (event) => {
    if (isKeyboardEvent(event) && event.key === 'Enter') {
      return;
    }
    setOpen(true);
  };

  if (!valueOptions || !colDef) {
    return null;
  }

  return (
    <rootProps.slots.baseSelect
      ref={ref}
      inputRef={inputRef}
      value={valueProp}
      onChange={handleChange}
      open={open}
      onOpen={handleOpen}
      MenuProps={{
        onClose: handleClose,
        ...MenuProps,
      }}
      error={error}
      native={isSelectNative}
      fullWidth
      {...other}
      {...otherBaseSelectProps}
    >
      {valueOptions.map((valueOption) => {
        const value = getOptionValue(valueOption);

        return (
          <rootProps.slots.baseSelectOption
            {...(rootProps.slotProps?.baseSelectOption || {})}
            native={isSelectNative}
            key={value}
            value={value}
          >
            {getOptionLabel(valueOption)}
          </rootProps.slots.baseSelectOption>
        );
      })}
    </rootProps.slots.baseSelect>
  );
}

export { GridEditSingleSelectCell };

export const renderEditSingleSelectCell = (params: GridEditSingleSelectCellProps) => (
  <GridEditSingleSelectCell {...params} />
);
