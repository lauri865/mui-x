import * as React from 'react';
import clsx from 'clsx';
import {
  unstable_composeClasses as composeClasses,
  unstable_useId as useId,
  unstable_useEnhancedEffect as useEnhancedEffect,
} from '@mui/utils';
import { getDataGridUtilityClass } from '../../constants/gridClasses';
import { GridRenderEditCellParams } from '../../models/params/gridCellParams';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';

type OwnerState = { classes: DataGridProcessedProps['classes'] };

const useUtilityClasses = (ownerState: OwnerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['editBooleanCell'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

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
  onValueChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue: boolean,
  ) => Promise<void> | void;
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
  const inputRef = React.useRef<HTMLInputElement>(null);
  const id = useId();
  const [valueState, setValueState] = React.useState(value);
  const rootProps = useGridRootProps();
  const ownerState = { classes: rootProps.classes };
  const classes = useUtilityClasses(ownerState);

  const handleChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.checked;

      if (onValueChange) {
        await onValueChange(event, newValue);
      }

      setValueState(newValue);
      await apiRef.current.setEditCellValue({ id: idProp, field, value: newValue }, event);
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
    <label htmlFor={id} className={clsx(classes.root, className)} {...other}>
      <rootProps.slots.baseCheckbox
        id={id}
        inputRef={inputRef}
        checked={Boolean(valueState)}
        onChange={handleChange}
        size="small"
        {...rootProps.slotProps?.baseCheckbox}
      />
    </label>
  );
}

export { GridEditBooleanCell };

export const renderEditBooleanCell = (params: GridEditBooleanCellProps) => (
  <GridEditBooleanCell {...params} />
);
