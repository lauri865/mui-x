import { forwardRef } from '@mui/x-internals/forwardRef';
import { gridColumnFieldsSelector, useGridSelector } from '../hooks';
import { GridPreferencePanelsValue } from '../hooks/features/preferencesPanel/gridPreferencePanelsValue';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';
import { GridOverlay, GridOverlayProps } from './containers/GridOverlay';

const GridNoColumnsOverlay = forwardRef<HTMLDivElement, GridOverlayProps>(
  function GridNoColumnsOverlay(props, ref) {
    const rootProps = useGridRootProps();
    const apiRef = useGridApiContext();
    const columns = useGridSelector(apiRef, gridColumnFieldsSelector);

    const handleOpenManageColumns = () => {
      apiRef.current.showPreferences(GridPreferencePanelsValue.columns);
    };

    const showManageColumnsButton = !rootProps.disableColumnSelector && columns.length > 0;

    return (
      <GridOverlay {...props} ref={ref} className="flex flex-col gap-4 bg-grid-bg">
        {apiRef.current.getLocaleText('noColumnsOverlayLabel')}
        {showManageColumnsButton && (
          <rootProps.slots.baseButton
            size="sm"
            {...rootProps.slotProps?.baseButton}
            onClick={handleOpenManageColumns}
          >
            {apiRef.current.getLocaleText('noColumnsOverlayManageColumns')}
          </rootProps.slots.baseButton>
        )}
      </GridOverlay>
    );
  },
);

export { GridNoColumnsOverlay };
