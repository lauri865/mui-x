import * as React from 'react';
import { unstable_useForkRef as useForkRef } from '@mui/utils';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { useGridSelector } from '../../hooks/utils/useGridSelector';
import type { GridRenderCellParams } from '../../models/params/gridCellParams';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { gridDetailPanelIsExpandedForRowIdSelector } from '../../hooks/features/detailPanel/gridDetailPanelSelector';
import clsx from 'clsx';

export const GridDetailPanelCell = forwardRef<HTMLInputElement, GridRenderCellParams>(
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
    const buttonRef = React.useRef<HTMLElement>(null);
    const handleRef = useForkRef(buttonRef, ref);
    const isExpanded = useGridSelector(apiRef, gridDetailPanelIsExpandedForRowIdSelector, id);

    const hasDetailPanel = React.useMemo(() => {
      if (!rootProps.getDetailPanelContent) {
        return false;
      }
      return rootProps.getDetailPanelContent(apiRef.current.getRowParams(id));
    }, [rootProps.getCellClassName]);

    // disable animations on mount / when reodering columns
    const enableAnimations = React.useRef(false);
    if (isExpanded) {
      enableAnimations.current = true;
    }

    useEnhancedEffect(() => {
      if (tabIndex === 0 && hasDetailPanel) {
        const element = apiRef.current.getCellElement(id, field);
        if (element) {
          element.tabIndex = -1;
        }
      }
    }, [apiRef, tabIndex, id, field, hasDetailPanel]);

    useEnhancedEffect(() => {
      if (hasFocus && hasDetailPanel) {
        const input = buttonRef.current?.querySelector('input');
        input?.focus({ preventScroll: true });
      }
    }, [hasFocus, hasDetailPanel]);

    if (rowNode.type === 'footer' || rowNode.type === 'pinnedRow') {
      return null;
    }

    const label = apiRef.current.getLocaleText('detailPanelToggle');

    return (
      <rootProps.slots.baseIconButton
        tabIndex={hasDetailPanel ? tabIndex : -1}
        aria-label={label}
        {...rootProps.slotProps?.baseIconButton}
        {...other}
        ref={handleRef}
        disabled={!hasDetailPanel}
        onClick={(event) => {
          event.preventDefault();
          apiRef.current.toggleDetailPanel(id);
        }}
        data-expanded={isExpanded || undefined}
      >
        {!isExpanded ? (
          <rootProps.slots.detailPanelExpandIcon
            className={clsx(enableAnimations.current && 'animate-in spin-in-[90deg] duration-150')}
          />
        ) : (
          <rootProps.slots.detailPanelCollapseIcon
            className={clsx(enableAnimations.current && 'animate-in spin-in-[-90deg] duration-150')}
          />
        )}
      </rootProps.slots.baseIconButton>
    );
  },
);
