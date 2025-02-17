import { unstable_useId as useId } from '@mui/utils';
import * as React from 'react';
import { useGridSelector } from '../../hooks';
import {
  gridPreferencePanelSelectorWithLabel,
  gridPreferencePanelStateSelector,
} from '../../hooks/features/preferencesPanel/gridPreferencePanelSelector';
import { GridPreferencePanelsValue } from '../../hooks/features/preferencesPanel/gridPreferencePanelsValue';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { GridColumnHeaderParams } from '../../models/params/gridColumnHeaderParams';

export interface ColumnHeaderFilterIconButtonProps {
  field: string;
  counter?: number;
  onClick?: (params: GridColumnHeaderParams, event: React.MouseEvent<HTMLButtonElement>) => void;
}

function GridColumnHeaderFilterIconButton(props: ColumnHeaderFilterIconButtonProps) {
  const { counter = 0, field, onClick } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const ownerState = { ...props, classes: rootProps.classes };
  const labelId = field;
  const isOpen = useGridSelector(apiRef, gridPreferencePanelSelectorWithLabel, labelId);
  const panelId = useId();

  const toggleFilter = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const { open, openedPanelValue } = gridPreferencePanelStateSelector(apiRef.current.state);

      if (open && openedPanelValue === GridPreferencePanelsValue.filters) {
        apiRef.current.hideFilterPanel();
      } else {
        apiRef.current.showFilterPanel(undefined, panelId, labelId);
      }

      if (onClick) {
        onClick(apiRef.current.getColumnHeaderParams(field), event);
      }
    },
    [apiRef, field, onClick, panelId, labelId],
  );

  if (!counter && !isOpen) {
    return null;
  }

  const iconButton = (
    <rootProps.slots.baseIconButton
      id={labelId}
      onClick={toggleFilter}
      aria-label={apiRef.current.getLocaleText('columnHeaderFiltersLabel')}
      size="icon"
      tabIndex={-1}
      variant={counter ? 'primary' : undefined}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-controls={isOpen ? panelId : undefined}
      {...rootProps.slotProps?.baseIconButton}
    >
      <rootProps.slots.columnFilteredIcon />
    </rootProps.slots.baseIconButton>
  );

  return (
    <rootProps.slots.baseTooltip
      title={
        counter &&
        (apiRef.current.getLocaleText('columnHeaderFiltersTooltipActive')(
          counter,
        ) as React.ReactElement<any>)
      }
      delay={500}
      {...rootProps.slotProps?.baseTooltip}
    >
      <span>
        {counter > 1 && (
          <rootProps.slots.baseBadge badgeContent={counter} color="default">
            {iconButton}
          </rootProps.slots.baseBadge>
        )}

        {(counter === 1 || isOpen) && iconButton}
      </span>
    </rootProps.slots.baseTooltip>
  );
}

export { GridColumnHeaderFilterIconButton };
