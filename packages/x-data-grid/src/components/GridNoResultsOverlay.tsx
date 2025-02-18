import { forwardRef } from '@mui/x-internals/forwardRef';
import * as React from 'react';
import {
  getDefaultGridFilterModel,
  gridFilterActiveItemsSelector,
  gridPreferencePanelStateSelector,
  useGridSelector,
} from '../hooks';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';
import { GridOverlay, GridOverlayProps } from './containers/GridOverlay';

export const GridNoResultsOverlay = forwardRef<HTMLDivElement, GridOverlayProps>(
  function GridNoResultsOverlay(props, ref) {
    const apiRef = useGridApiContext();
    const rootProps = useGridRootProps();
    const noResultsOverlayLabel = apiRef.current.getLocaleText('noResultsOverlayLabel');
    const filterActiveItems = gridFilterActiveItemsSelector(apiRef);
    const preferencePanelState = useGridSelector(apiRef, gridPreferencePanelStateSelector);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
      if (buttonRef.current && !preferencePanelState.open) {
        buttonRef.current.focus();
      }
    }, [preferencePanelState.open]);

    return (
      <GridOverlay {...props} ref={ref} className="flex flex-col gap-2">
        {noResultsOverlayLabel}
        {filterActiveItems.length > 0 && (
          <rootProps.slots.baseButton
            ref={buttonRef}
            onClick={() => {
              apiRef.current.setFilterModel(getDefaultGridFilterModel());
            }}
            size="sm"
          >
            {apiRef.current.getLocaleText('noResultsOverlayClearAllFilters')}
          </rootProps.slots.baseButton>
        )}
      </GridOverlay>
    );
  },
);
