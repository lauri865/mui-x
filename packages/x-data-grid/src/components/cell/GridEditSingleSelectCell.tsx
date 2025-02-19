import { unstable_useEnhancedEffect as useEnhancedEffect } from '@mui/utils';
import * as React from 'react';
import { useThemedComponent } from '../../context/GridThemeContext';
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
  onValueChange?: (newValue: any) => Promise<void> | void;
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
  const inputRef = React.useRef<any>(null);
  const [open, setOpen] = React.useState(initialOpen);
  const classes = useThemedComponent('editCell', {
    singleSelect: true,
  });

  const baseSelectProps = rootProps.slotProps?.baseSelect || {};
  const isSelectNative = false;

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

  const getOptionValue = colDef.editCellParams.getOptionValue!;
  const getOptionLabel = colDef.editCellParams.getOptionLabel!;
  console.log('colDef', colDef);

  const handleChange = async (value: string) => {
    if (!isSingleSelectColDef(colDef) || !valueOptions) {
      return;
    }

    setOpen(false);
    // NativeSelect casts the value to a string.
    const formattedTargetValue = getValueFromValueOptions(value, valueOptions, getOptionValue);

    if (onValueChange) {
      await onValueChange(formattedTargetValue);
    }

    await apiRef.current.setEditCellValue({ id, field, value: formattedTargetValue });
  };

  const handleClose = (reason: GridCellEditStopReasons) => {
    if (rootProps.editMode === GridEditModes.Row) {
      setOpen(false);
      return;
    }
    if (!open) {
      return;
    }
    if (
      reason === GridCellEditStopReasons.escapeKeyDown ||
      reason === GridCellEditStopReasons.enterKeyDown
    ) {
      const params = apiRef.current.getCellParams(id, field);
      apiRef.current.publishEvent('cellEditStop', {
        ...params,
        reason,
      });
    }
  };

  if (!valueOptions || !colDef) {
    return null;
  }

  const Select = rootProps.slots.baseSelect;

  return (
    <Select.Root
      value={valueProp || ''}
      onValueChange={handleChange}
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          handleClose(GridCellEditStopReasons.cellFocusOut);
        }
        setOpen(open);
      }}
    >
      <Select.Trigger ref={inputRef} variant="ghost" className={classes.root} tabIndex={tabIndex}>
        <Select.Value>{formattedValue}</Select.Value>
      </Select.Trigger>
      <Select.Content onEscapeKeyDown={() => handleClose(GridCellEditStopReasons.escapeKeyDown)}>
        {valueOptions.map((valueOption) => {
          const value = getOptionValue(valueOption);

          return (
            <Select.Item key={value} value={value}>
              {getOptionLabel(valueOption)}
            </Select.Item>
          );
        })}
      </Select.Content>
    </Select.Root>
  );
}

export { GridEditSingleSelectCell };

export const renderEditSingleSelectCell = (params: GridEditSingleSelectCellProps) => (
  <GridEditSingleSelectCell {...params} />
);
