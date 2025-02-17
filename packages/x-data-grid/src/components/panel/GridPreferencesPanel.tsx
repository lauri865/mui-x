import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import React from 'react';
import { gridColumnDefinitionsSelector } from '../../hooks/features/columns/gridColumnsSelector';
import { gridPreferencePanelStateSelector } from '../../hooks/features/preferencesPanel/gridPreferencePanelSelector';
import { GridPreferencePanelsValue } from '../../hooks/features/preferencesPanel/gridPreferencePanelsValue';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { useGridSelector } from '../../hooks/utils/useGridSelector';
import { useGridApiOptionHandler, useGridPrivateApiContext } from '../../internals';

export function GridPreferencesPanel() {
  const apiRef = useGridPrivateApiContext();
  const columns = useGridSelector(apiRef, gridColumnDefinitionsSelector);
  const rootProps = useGridRootProps();
  const preferencePanelState = useGridSelector(apiRef, gridPreferencePanelStateSelector);

  const panelContent = apiRef.current.unstable_applyPipeProcessors(
    'preferencePanel',
    null,
    preferencePanelState.openedPanelValue ?? GridPreferencePanelsValue.filters,
  );

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  useGridApiOptionHandler(apiRef, 'rootMount', (el) => {
    const panelAnchor = el.querySelector('[data-id="gridPanelAnchor"]');

    if (panelAnchor) {
      setAnchorEl(panelAnchor as HTMLElement);
    }
  });

  const open = columns.length > 0 && preferencePanelState.open;
  const headerEl = React.useMemo(() => {
    if (!preferencePanelState.labelId || !open) {
      return null;
    }
    return apiRef.current.getColumnHeaderElement(preferencePanelState.labelId);
  }, [preferencePanelState.labelId, open]);

  if (!open) {
    return null;
  }
  const Popover = rootProps.slots.basePopper;

  return (
    <Popover.Root
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          apiRef.current.hidePreferences();
          requestAnimationFrame(() => {
            if (document.activeElement !== document.body) {
              return;
            }
            const focusedEl = apiRef.current.rootElementRef?.current?.querySelector(
              '[tabindex="0"]',
            ) as HTMLElement;
            focusedEl?.focus();
          });
        }
      }}
    >
      <Popover.Anchor asChild>
        <FakeAnchor anchorEl={headerEl ?? anchorEl} />
      </Popover.Anchor>
      <Popover.Content
        id={preferencePanelState.panelId}
        aria-labelledby={preferencePanelState.labelId}
        side="bottom"
        align={headerEl ? 'center' : 'end'}
        sideOffset={headerEl ? -4 : 0}
        alignOffset={headerEl ? undefined : 12}
        className={clsx(
          'bg-grid-bg/80 backdrop-blur-sm  w-auto min-w-[220px] p-0',
          !headerEl && 'rounded-t-none -mt-px -mx-px ',
        )}
        updatePositionStrategy="always"
        avoidCollisions={false}
      >
        {panelContent}
      </Popover.Content>
    </Popover.Root>
  );
  return (
    <rootProps.slots.panel
      as={rootProps.slots.basePopper}
      open={columns.length > 0 && preferencePanelState.open}
      id={preferencePanelState.panelId}
      aria-labelledby={preferencePanelState.labelId}
      {...rootProps.slotProps?.panel}
      {...rootProps.slotProps?.basePopper}
    >
      {panelContent}
    </rootProps.slots.panel>
  );
}

const FakeAnchor = forwardRef<HTMLElement, { anchorEl: HTMLElement | null }>(
  ({ anchorEl = null }, ref) => {
    useEnhancedEffect(() => {
      if (typeof ref === 'function') {
        ref(anchorEl);
      }
    }, [anchorEl]);
    return null;
  },
);
