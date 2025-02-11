import { unstable_useForkRef as useForkRef } from '@mui/utils';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { forwardRef } from '@mui/x-internals/forwardRef';
import * as React from 'react';
import { getCheckboxPropsSelector } from '../../hooks/features/rowSelection/utils';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { objectShallowCompare, useGridSelector } from '../../hooks/utils/useGridSelector';
import type { GridRenderCellParams } from '../../models/params/gridCellParams';
import type { GridRowSelectionCheckboxParams } from '../../models/params/gridRowSelectionCheckboxParams';

const GridCellCheckboxForwardRef = forwardRef<HTMLInputElement, GridRenderCellParams>(
  function GridCellCheckboxRenderer(props, ref) {
    const {
      field,
      id,
      formattedValue,
      row,
      rowNode,
      colDef,
      isEditable,
      cellMode,
      hasFocus,
      tabIndex,
      api,
      ...other
    } = props;
    const apiRef = useGridApiContext();
    const rootProps = useGridRootProps();
    const checkboxElement = React.useRef<HTMLElement>(null);

    const handleRef = useForkRef(checkboxElement, ref);

    const handleChange = (checked: boolean) => {
      const params: GridRowSelectionCheckboxParams = { value: checked, id };
      apiRef.current.publishEvent('rowSelectionCheckboxChange', params, {} as any);
    };

    useEnhancedEffect(() => {
      if (tabIndex === 0) {
        const element = apiRef.current.getCellElement(id, field);
        if (element) {
          element.tabIndex = -1;
        }
      }
    }, [apiRef, tabIndex, id, field]);

    useEnhancedEffect(() => {
      if (hasFocus) {
        const input = checkboxElement.current?.querySelector('input');
        input?.focus({ preventScroll: true });
      }
    }, [hasFocus]);

    const isSelectable = apiRef.current.isRowSelectable(id);

    const checkboxPropsSelector = getCheckboxPropsSelector(
      id,
      rootProps.rowSelectionPropagation?.parents ?? false,
    );
    const { isIndeterminate, isChecked } = useGridSelector(
      apiRef,
      checkboxPropsSelector,
      undefined,
      objectShallowCompare,
    );

    if (rowNode.type === 'footer' || rowNode.type === 'pinnedRow') {
      return null;
    }

    const label = apiRef.current.getLocaleText(
      isChecked && !isIndeterminate ? 'checkboxSelectionUnselectRow' : 'checkboxSelectionSelectRow',
    );

    return (
      <rootProps.slots.baseCheckbox
        tabIndex={tabIndex}
        checked={isChecked && !isIndeterminate}
        onCheckedChange={handleChange}
        aria-label={label}
        name={'select_row'}
        disabled={!isSelectable}
        {...rootProps.slotProps?.baseCheckbox}
        {...other}
        ref={handleRef}
      />
    );
  },
);

export { GridCellCheckboxForwardRef };

export const GridCellCheckboxRenderer = GridCellCheckboxForwardRef;
