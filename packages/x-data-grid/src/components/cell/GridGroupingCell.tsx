import { unstable_useForkRef as useForkRef } from '@mui/utils';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import * as React from 'react';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import type { GridRenderCellParams } from '../../models/params/gridCellParams';

export const GridGroupingCell = forwardRef<HTMLInputElement, GridRenderCellParams>(
  function GridGroupingCellRenderer(props, ref) {
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
    const buttonRef = React.useRef<HTMLElement>(null);
    const handleRef = useForkRef(buttonRef, ref);

    if (rowNode.type === 'footer' || rowNode.type === 'pinnedRow') {
      return null;
    }

    if (rowNode.type === 'leaf') {
      // don't render leaves
      // TODO: maybe we want to allow it in the future
      return <>&nbsp;</>;
    }

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
        buttonRef.current?.focus({ preventScroll: true });
      }
    }, [hasFocus]);

    const isExpanded = rowNode.childrenExpanded;
    // disable animations on mount / when reodering columns
    const enableAnimations = React.useRef(false);
    if (isExpanded) {
      enableAnimations.current = true;
    }
    const label = apiRef.current.getLocaleText('treeDataExpand');
    const Badge = rootProps.slots.baseBadge ?? 'span';

    const groupingField = rowNode.groupingField!;
    const groupingColDef = apiRef.current.getColumn(groupingField);
    let value: React.ReactNode = rowNode.groupingKey;
    if (groupingColDef?.renderCell) {
      value = groupingColDef.renderCell({
        ...props,
        value,
        field: groupingField,
        formattedValue: groupingColDef.valueFormatter
          ? groupingColDef.valueFormatter(value as never, row, groupingColDef, apiRef)
          : value,
      });
    } else if (groupingColDef?.valueFormatter) {
      value = groupingColDef.valueFormatter(value as never, row, groupingColDef, apiRef);
    }

    return (
      <>
        <rootProps.slots.baseIconButton
          tabIndex={hasFocus ? 0 : -1}
          aria-label={label}
          {...rootProps.slotProps?.baseIconButton}
          {...other}
          ref={handleRef}
          onClick={(event) => {
            apiRef.current.setRowChildrenExpansion(id, !isExpanded);
          }}
          data-expanded={isExpanded || undefined}
        >
          {!isExpanded ? (
            <rootProps.slots.groupingCriteriaExpandIcon
              className={clsx(
                enableAnimations.current && 'animate-in spin-in-[90deg] duration-150',
              )}
            />
          ) : (
            <rootProps.slots.groupingCriteriaCollapseIcon
              className={clsx(
                enableAnimations.current && 'animate-in spin-in-[-90deg] duration-150',
              )}
            />
          )}
        </rootProps.slots.baseIconButton>
        <span className="grouping-label">{value}</span> <Badge>{rowNode.children.length}</Badge>
      </>
    );
  },
);
