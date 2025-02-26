import { RefObject } from '@mui/x-internals/types';
import { GridApi } from '../../../models/api/gridApiCommunity';
import { DataGridProcessedProps } from '../../../models/props/DataGridProps';
import { useGridApiOptionHandler } from '../../utils/useGridApiEventHandler';

/**
 * @requires useGridFocus (event) - can be after, async only
 * @requires useGridColumns (event) - can be after, async only
 */
export function useGridEvents(
  apiRef: RefObject<GridApi>,
  props: Pick<
    DataGridProcessedProps,
    | 'onColumnHeaderClick'
    | 'onColumnHeaderDoubleClick'
    | 'onColumnHeaderContextMenu'
    | 'onColumnHeaderOver'
    | 'onColumnHeaderOut'
    | 'onColumnHeaderEnter'
    | 'onColumnHeaderLeave'
    | 'onCellClick'
    | 'onCellDoubleClick'
    | 'onCellKeyDown'
    | 'onPreferencePanelClose'
    | 'onPreferencePanelOpen'
    | 'onRowDoubleClick'
    | 'onRowClick'
    | 'onStateChange'
    | 'onMenuOpen'
    | 'onMenuClose'
  >,
): void {
  useGridApiOptionHandler(apiRef, 'columnHeaderClick', props.onColumnHeaderClick);
  useGridApiOptionHandler(apiRef, 'columnHeaderContextMenu', props.onColumnHeaderContextMenu);
  useGridApiOptionHandler(apiRef, 'columnHeaderDoubleClick', props.onColumnHeaderDoubleClick);
  useGridApiOptionHandler(apiRef, 'columnHeaderOver', props.onColumnHeaderOver);
  useGridApiOptionHandler(apiRef, 'columnHeaderOut', props.onColumnHeaderOut);
  useGridApiOptionHandler(apiRef, 'columnHeaderEnter', props.onColumnHeaderEnter);
  useGridApiOptionHandler(apiRef, 'columnHeaderLeave', props.onColumnHeaderLeave);

  useGridApiOptionHandler(apiRef, 'cellClick', props.onCellClick);
  useGridApiOptionHandler(apiRef, 'cellDoubleClick', props.onCellDoubleClick);
  useGridApiOptionHandler(apiRef, 'cellKeyDown', props.onCellKeyDown);

  useGridApiOptionHandler(apiRef, 'preferencePanelClose', props.onPreferencePanelClose);
  useGridApiOptionHandler(apiRef, 'preferencePanelOpen', props.onPreferencePanelOpen);

  useGridApiOptionHandler(apiRef, 'menuOpen', props.onMenuOpen);
  useGridApiOptionHandler(apiRef, 'menuClose', props.onMenuClose);

  useGridApiOptionHandler(apiRef, 'rowDoubleClick', props.onRowDoubleClick);
  useGridApiOptionHandler(apiRef, 'rowClick', props.onRowClick);

  useGridApiOptionHandler(apiRef, 'stateChange', props.onStateChange);
}
