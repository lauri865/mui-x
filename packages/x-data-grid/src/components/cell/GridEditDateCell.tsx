import {
  unstable_composeClasses as composeClasses,
  unstable_useEnhancedEffect as useEnhancedEffect,
} from '@mui/utils';
import * as React from 'react';
import { getDataGridUtilityClass } from '../../constants/gridClasses';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { GridRenderEditCellParams } from '../../models/params/gridCellParams';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';

type OwnerState = { classes: DataGridProcessedProps['classes'] };

const useUtilityClasses = (ownerState: OwnerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['editInputCell'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

export interface GridEditDateCellProps extends GridRenderEditCellParams {
  /**
   * Callback called when the value is changed by the user.
   * @param {React.ChangeEvent<HTMLInputElement>} event The event source of the callback.
   * @param {Date | null} newValue The value that is going to be passed to `apiRef.current.setEditCellValue`.
   * @returns {Promise<void> | void} A promise to be awaited before calling `apiRef.current.setEditCellValue`
   */
  onValueChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue: Date | null,
  ) => Promise<void> | void;
}

function GridEditDateCell(props: GridEditDateCellProps) {
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
    hasFocus,
    inputProps,
    isValidating,
    isProcessingProps,
    onValueChange,
    ...other
  } = props;

  const isDateTime = colDef.type === 'dateTime';
  const apiRef = useGridApiContext();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const valueTransformed = React.useMemo(() => {
    let parsedDate: Date | null;

    if (valueProp == null) {
      parsedDate = null;
    } else if (valueProp instanceof Date) {
      parsedDate = valueProp;
    } else {
      parsedDate = new Date((valueProp ?? '').toString());
    }

    let formattedDate: string;
    if (parsedDate == null || Number.isNaN(parsedDate.getTime())) {
      formattedDate = '';
    } else {
      const localDate = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60 * 1000);
      formattedDate = localDate.toISOString().substr(0, isDateTime ? 16 : 10);
    }

    return {
      parsed: parsedDate,
      formatted: formattedDate,
    };
  }, [valueProp, isDateTime]);

  const [valueState, setValueState] = React.useState(valueTransformed);
  const rootProps = useGridRootProps();
  const ownerState = { classes: rootProps.classes };
  const classes = useUtilityClasses(ownerState);

  const parseValueToDate = React.useCallback((value: string) => {
    if (value === '') {
      return null;
    }

    const [date, time] = value.split('T');
    const [year, month, day] = date.split('-');

    const parsedDate = new Date();
    parsedDate.setFullYear(Number(year), Number(month) - 1, Number(day));
    parsedDate.setHours(0, 0, 0, 0);

    if (time) {
      const [hours, minutes] = time.split(':');
      parsedDate.setHours(Number(hours), Number(minutes), 0, 0);
    }

    return parsedDate;
  }, []);

  const handleChange = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const newFormattedDate = event.target.value;
      const newParsedDate = parseValueToDate(newFormattedDate);

      if (onValueChange) {
        await onValueChange(event, newParsedDate);
      }

      setValueState({ parsed: newParsedDate, formatted: newFormattedDate });
      apiRef.current.setEditCellValue({ id, field, value: newParsedDate }, event);
    },
    [apiRef, field, id, onValueChange, parseValueToDate],
  );

  React.useEffect(() => {
    setValueState((state) => {
      if (
        valueTransformed.parsed !== state.parsed &&
        valueTransformed.parsed?.getTime() !== state.parsed?.getTime()
      ) {
        return valueTransformed;
      }
      return state;
    });
  }, [valueTransformed]);

  useEnhancedEffect(() => {
    if (hasFocus) {
      inputRef.current!.focus();
    }
  }, [hasFocus]);

  return null;
  // TODO: use custom datepicker
  return (
    <StyledInputBase
      inputRef={inputRef}
      fullWidth
      className={classes.root}
      type={isDateTime ? 'datetime-local' : 'date'}
      inputProps={{
        max: isDateTime ? '9999-12-31T23:59' : '9999-12-31',
        ...inputProps,
      }}
      value={valueState.formatted}
      onChange={handleChange}
      {...other}
    />
  );
}

export { GridEditDateCell };

export const renderEditDateCell = (params: GridRenderEditCellParams) => (
  <GridEditDateCell {...params} />
);
