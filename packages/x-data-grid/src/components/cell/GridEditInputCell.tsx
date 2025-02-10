import { unstable_useEnhancedEffect as useEnhancedEffect } from '@mui/utils';
import { forwardRef } from '@mui/x-internals/forwardRef';
import * as React from 'react';
import { useThemedComponent } from '../../context/GridThemeContext';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { GridRenderEditCellParams } from '../../models/params/gridCellParams';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';

type OwnerState = DataGridProcessedProps;

export interface GridEditInputCellProps extends GridRenderEditCellParams {
  debounceMs?: number;
  /**
   * Callback called when the value is changed by the user.
   * @param {React.ChangeEvent<HTMLInputElement>} event The event source of the callback.
   * @param {Date | null} newValue The value that is going to be passed to `apiRef.current.setEditCellValue`.
   * @returns {Promise<void> | void} A promise to be awaited before calling `apiRef.current.setEditCellValue`
   */
  onValueChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue: string,
  ) => Promise<void> | void;
}

const GridEditInputCell = forwardRef<HTMLInputElement, GridEditInputCellProps>((props, ref) => {
  const rootProps = useGridRootProps();

  const {
    id,
    value,
    formattedValue,
    api,
    field,
    row,
    rowNode,
    colDef,
    cellMode,
    isEditable,
    tabIndex,
    hasFocus,
    isValidating,
    debounceMs = 200,
    isProcessingProps,
    onValueChange,
    ...other
  } = props;

  const apiRef = useGridApiContext();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [valueState, setValueState] = React.useState(value);
  const classes = useThemedComponent('editCell');

  const handleChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      if (onValueChange) {
        await onValueChange(event, newValue);
      }

      const column = apiRef.current.getColumn(field);

      let parsedValue = newValue;
      if (column.valueParser) {
        parsedValue = column.valueParser(newValue, apiRef.current.getRow(id), column, apiRef);
      }

      setValueState(parsedValue);
      apiRef.current.setEditCellValue(
        { id, field, value: parsedValue, debounceMs, unstable_skipValueParser: true },
        event,
      );
    },
    [apiRef, debounceMs, field, id, onValueChange],
  );

  const meta = apiRef.current.unstable_getEditCellMeta(id, field);

  React.useEffect(() => {
    if (meta?.changeReason !== 'debouncedSetEditCellValue') {
      setValueState(value);
    }
  }, [meta, value]);

  useEnhancedEffect(() => {
    if (hasFocus) {
      inputRef.current!.focus();
    }
  }, [hasFocus]);

  return (
    <GridEditInputCellRoot
      inputRef={inputRef}
      className={classes.root}
      ownerState={rootProps}
      fullWidth
      type={colDef.type === 'number' ? colDef.type : 'text'}
      value={valueState ?? ''}
      onChange={handleChange}
      endAdornment={
        isProcessingProps ? <rootProps.slots.loadIcon fontSize="small" color="action" /> : undefined
      }
      {...other}
      ref={ref}
    />
  );
});

export { GridEditInputCell };

export const renderEditInputCell = (params: GridEditInputCellProps) => (
  <GridEditInputCell {...params} />
);
