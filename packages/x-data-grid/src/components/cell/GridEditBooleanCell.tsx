import {
  unstable_useEnhancedEffect as useEnhancedEffect,
  unstable_useId as useId,
} from '@mui/utils';
import * as React from 'react';
import { useThemedComponent } from '../../context/GridThemeContext';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { GridRenderEditCellParams } from '../../models/params/gridCellParams';

export interface GridEditBooleanCellProps
  extends GridRenderEditCellParams,
    Omit<
      React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>,
      'id' | 'tabIndex'
    > {
  /**
   * Callback called when the value is changed by the user.
   * @param {React.ChangeEvent<HTMLInputElement>} event The event source of the callback.
   * @param {boolean} newValue The value that is going to be passed to `apiRef.current.setEditCellValue`.
   * @returns {Promise<void> | void} A promise to be awaited before calling `apiRef.current.setEditCellValue`
   */
  onValueChange?: (newValue: boolean) => Promise<void> | void;
}

function GridEditBooleanCell(props: GridEditBooleanCellProps) {
  const {
    id: idProp,
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
    className,
    hasFocus,
    isValidating,
    isProcessingProps,
    error,
    onValueChange,
    ...other
  } = props;

  const apiRef = useGridApiContext();
  const inputRef = React.useRef<HTMLButtonElement>(null);
  const id = useId();
  const [valueState, setValueState] = React.useState(value);
  const rootProps = useGridRootProps();
  const ownerState = { classes: rootProps.classes };
  const classes = useThemedComponent('editCell');

  const handleChange = React.useCallback(
    async (checked: boolean) => {
      if (onValueChange) {
        await onValueChange(checked);
      }

      setValueState(checked);
      await apiRef.current.setEditCellValue({ id: idProp, field, value: checked });
    },
    [apiRef, field, idProp, onValueChange],
  );

  React.useEffect(() => {
    setValueState(value);
  }, [value]);

  useEnhancedEffect(() => {
    if (hasFocus) {
      inputRef.current!.focus();
    }
  }, [hasFocus]);

  return (
    <rootProps.slots.baseCheckbox
      id={id}
      ref={inputRef}
      checked={Boolean(valueState)}
      onCheckedChange={handleChange}
      {...rootProps.slotProps?.baseCheckbox}
    />
  );
}

export { GridEditBooleanCell };

export const renderEditBooleanCell = (params: GridEditBooleanCellProps) => (
  <GridEditBooleanCell {...params} />
);
