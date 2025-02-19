import { unstable_useForkRef as useForkRef } from '@mui/utils';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { forwardRef } from '@mui/x-internals/forwardRef';
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
      focusElementRef,
      ...other
    } = props;
    const apiRef = useGridApiContext();
    const rootProps = useGridRootProps();

    const handleRef = useForkRef(focusElementRef, ref);

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

    const handleChange = (checked: boolean) => {
      const params: GridRowSelectionCheckboxParams = { value: checked && !isIndeterminate, id };
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

    if (rowNode.type === 'footer' || rowNode.type === 'pinnedRow') {
      return null;
    }

    const label = apiRef.current.getLocaleText(
      isChecked && !isIndeterminate ? 'checkboxSelectionUnselectRow' : 'checkboxSelectionSelectRow',
    );

    return (
      <rootProps.slots.baseCheckbox
        tabIndex={tabIndex}
        checked={isIndeterminate ? 'indeterminate' : isChecked}
        onCheckedChange={handleChange}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            handleChange(!isChecked);
          }
        }}
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
