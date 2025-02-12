import { unstable_useForkRef as useForkRef } from '@mui/utils';
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

    const isExpanded = rowNode.childrenExpanded;
    // disable animations on mount / when reodering columns
    const enableAnimations = React.useRef(false);
    if (isExpanded) {
      enableAnimations.current = true;
    }
    const label = apiRef.current.getLocaleText('treeDataExpand');

    return (
      <>
        <rootProps.slots.baseIconButton
          tabIndex={-1}
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
            <rootProps.slots.detailPanelExpandIcon
              className={clsx(
                enableAnimations.current && 'animate-in spin-in-[90deg] duration-150',
              )}
            />
          ) : (
            <rootProps.slots.detailPanelCollapseIcon
              className={clsx(
                enableAnimations.current && 'animate-in spin-in-[-90deg] duration-150',
              )}
            />
          )}
        </rootProps.slots.baseIconButton>
        {rowNode.groupingKey} ({rowNode.children.length})
      </>
    );
  },
);
