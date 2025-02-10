import { fastMemo } from '@mui/x-internals/fastMemo';
import {
  gridColumnGroupsHeaderMaxDepthSelector,
  gridColumnGroupsHeaderStructureSelector,
} from '../hooks/features/columnGrouping/gridColumnGroupsSelector';
import {
  gridColumnVisibilityModelSelector,
  gridVisibleColumnDefinitionsSelector,
} from '../hooks/features/columns/gridColumnsSelector';
import { gridFilterActiveItemsLookupSelector } from '../hooks/features/filter/gridFilterSelector';
import {
  gridFocusColumnGroupHeaderSelector,
  gridFocusColumnHeaderSelector,
  gridTabIndexCellSelector,
  gridTabIndexColumnGroupHeaderSelector,
  gridTabIndexColumnHeaderSelector,
} from '../hooks/features/focus/gridFocusStateSelector';
import { gridSortColumnLookupSelector } from '../hooks/features/sorting/gridSortingSelector';
import { useGridPrivateApiContext } from '../hooks/utils/useGridPrivateApiContext';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';
import { useGridSelector } from '../hooks/utils/useGridSelector';

function GridHeaders() {
  const apiRef = useGridPrivateApiContext();
  const rootProps = useGridRootProps();

  const visibleColumns = useGridSelector(apiRef, gridVisibleColumnDefinitionsSelector);
  const filterColumnLookup = useGridSelector(apiRef, gridFilterActiveItemsLookupSelector);
  const sortColumnLookup = useGridSelector(apiRef, gridSortColumnLookupSelector);
  const columnHeaderTabIndexState = useGridSelector(apiRef, gridTabIndexColumnHeaderSelector);
  const hasNoCellTabIndexState = useGridSelector(
    apiRef,
    () => gridTabIndexCellSelector(apiRef) === null,
  );

  const columnGroupHeaderTabIndexState = useGridSelector(
    apiRef,
    gridTabIndexColumnGroupHeaderSelector,
  );

  const columnHeaderFocus = useGridSelector(apiRef, gridFocusColumnHeaderSelector);
  const columnGroupHeaderFocus = useGridSelector(apiRef, gridFocusColumnGroupHeaderSelector);

  const headerGroupingMaxDepth = useGridSelector(apiRef, gridColumnGroupsHeaderMaxDepthSelector);

  const columnVisibility = useGridSelector(apiRef, gridColumnVisibilityModelSelector);
  const columnGroupsHeaderStructure = useGridSelector(
    apiRef,
    gridColumnGroupsHeaderStructureSelector,
  );

  const hasOtherElementInTabSequence = !(
    columnGroupHeaderTabIndexState === null &&
    columnHeaderTabIndexState === null &&
    hasNoCellTabIndexState
  );

  const columnsContainerRef = apiRef.current.columnHeadersContainerRef;

  return (
    <rootProps.slots.columnHeaders
      ref={columnsContainerRef}
      visibleColumns={visibleColumns}
      filterColumnLookup={filterColumnLookup}
      sortColumnLookup={sortColumnLookup}
      columnHeaderTabIndexState={columnHeaderTabIndexState}
      columnGroupHeaderTabIndexState={columnGroupHeaderTabIndexState}
      columnHeaderFocus={columnHeaderFocus}
      columnGroupHeaderFocus={columnGroupHeaderFocus}
      headerGroupingMaxDepth={headerGroupingMaxDepth}
      columnMenuState={{ open: false, field: '' }}
      columnVisibility={columnVisibility}
      columnGroupsHeaderStructure={columnGroupsHeaderStructure}
      hasOtherElementInTabSequence={hasOtherElementInTabSequence}
      {...rootProps.slotProps?.columnHeaders}
    />
  );
}

const MemoizedGridHeaders = fastMemo(GridHeaders);

export { MemoizedGridHeaders as GridHeaders };
