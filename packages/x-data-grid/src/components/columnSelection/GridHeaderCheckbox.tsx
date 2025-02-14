import composeClasses from '@mui/utils/composeClasses';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { forwardRef } from '@mui/x-internals/forwardRef';
import * as React from 'react';
import { getDataGridUtilityClass } from '../../constants/gridClasses';
import { gridTabIndexColumnHeaderSelector } from '../../hooks/features/focus/gridFocusStateSelector';
import { gridRowSelectionStateSelector } from '../../hooks/features/rowSelection/gridRowSelectionSelector';
import { isMultipleRowSelectionEnabled } from '../../hooks/features/rowSelection/utils';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { useGridSelector } from '../../hooks/utils/useGridSelector';
import { useGridVisibleRows } from '../../hooks/utils/useGridVisibleRows';
import type { GridRowId } from '../../models/gridRows';
import type { GridColumnHeaderParams } from '../../models/params/gridColumnHeaderParams';
import type { GridHeaderSelectionCheckboxParams } from '../../models/params/gridHeaderSelectionCheckboxParams';
import type { DataGridProcessedProps } from '../../models/props/DataGridProps';

type OwnerState = { classes: DataGridProcessedProps['classes'] };

const useUtilityClasses = (ownerState: OwnerState) => {
  const { classes } = ownerState;

  const slots = {
    root: ['checkboxInput'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

const GridHeaderCheckbox = forwardRef<HTMLButtonElement, GridColumnHeaderParams>(
  function GridHeaderCheckbox(props, ref) {
    const { field, colDef, ...other } = props;
    const apiRef = useGridApiContext();
    const rootProps = useGridRootProps();
    const ownerState = { classes: rootProps.classes };
    const classes = useUtilityClasses(ownerState);
    const tabIndexState = useGridSelector(apiRef, gridTabIndexColumnHeaderSelector);
    const selection = useGridSelector(apiRef, gridRowSelectionStateSelector);
    const visibleRows = useGridVisibleRows(apiRef).rows;

    const filteredSelection = React.useMemo(() => {
      if (typeof rootProps.isRowSelectable !== 'function') {
        return selection;
      }

      return selection.filter((id) => {
        if (rootProps.keepNonExistentRowsSelected) {
          return true;
        }
        // The row might have been deleted
        if (!apiRef.current.getRow(id)) {
          return false;
        }

        return rootProps.isRowSelectable!(apiRef.current.getRowParams(id));
      });
    }, [apiRef, rootProps.isRowSelectable, selection, rootProps.keepNonExistentRowsSelected]);

    // All the rows that could be selected / unselected by toggling this checkbox
    const selectionCandidates = React.useMemo(() => {
      const rowIds = visibleRows.map((row) => row.id);

      // Convert to an object to make O(1) checking if a row exists or not
      // TODO create selector that returns visibleRowIds/paginatedVisibleRowIds as an object
      return rowIds.reduce<Record<GridRowId, true>>((acc, id) => {
        if (!apiRef.current.isRowSelectable(id)) {
          return acc;
        }
        acc[id] = true;
        return acc;
      }, {});
    }, [apiRef, rootProps.pagination, rootProps.checkboxSelectionVisibleOnly]);

    // Amount of rows selected and that are visible in the current page
    const currentSelectionSize = React.useMemo(
      () => filteredSelection.filter((id) => selectionCandidates[id]).length,
      [filteredSelection, selectionCandidates],
    );

    const isIndeterminate =
      currentSelectionSize > 0 && currentSelectionSize < Object.keys(selectionCandidates).length;

    const isChecked = currentSelectionSize > 0;

    const handleChange = (checked: boolean) => {
      const params: GridHeaderSelectionCheckboxParams = {
        value: checked && !isIndeterminate,
      };

      apiRef.current.publishEvent('headerSelectionCheckboxChange', params);
    };

    const tabIndex = tabIndexState !== null && tabIndexState.field === props.field ? 0 : -1;
    useEnhancedEffect(() => {
      const element = apiRef.current.getColumnHeaderElement(props.field);
      if (tabIndex === 0 && element) {
        element!.tabIndex = -1;
      }
    }, [tabIndex, apiRef, props.field]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === ' ' || event.key === 'Enter') {
          // imperative toggle the checkbox because Space is disable by some preventDefault
          apiRef.current.publishEvent('headerSelectionCheckboxChange', {
            value: !isChecked,
          });
        }
      },
      [apiRef, isChecked],
    );

    const label = apiRef.current.getLocaleText(
      isChecked && !isIndeterminate
        ? 'checkboxSelectionUnselectAllRows'
        : 'checkboxSelectionSelectAllRows',
    );

    return (
      <rootProps.slots.baseCheckbox
        checked={isIndeterminate ? 'indeterminate' : isChecked}
        onCheckedChange={handleChange}
        className={classes.root}
        aria-label={label}
        name={'select_all_rows'}
        tabIndex={tabIndex}
        onKeyDown={handleKeyDown}
        disabled={!isMultipleRowSelectionEnabled(rootProps)}
        {...rootProps.slotProps?.baseCheckbox}
        {...other}
        ref={ref}
      />
    );
  },
);

export { GridHeaderCheckbox };
