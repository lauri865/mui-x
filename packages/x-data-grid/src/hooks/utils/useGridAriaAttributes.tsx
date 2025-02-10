import * as React from 'react';
import { gridColumnGroupsHeaderMaxDepthSelector } from '../features/columnGrouping/gridColumnGroupsSelector';
import { gridVisibleColumnDefinitionsSelector } from '../features/columns/gridColumnsSelector';
import { gridExpandedRowCountSelector } from '../features/filter/gridFilterSelector';
import { gridVisiblePinnedRowsCountSelector } from '../features/rowPinning';
import { isMultipleRowSelectionEnabled } from '../features/rowSelection/utils';
import { useGridPrivateApiContext } from './useGridPrivateApiContext';
import { useGridRootProps } from './useGridRootProps';
import { useGridSelector } from './useGridSelector';

export const useGridAriaAttributes = (): React.HTMLAttributes<HTMLElement> => {
  const apiRef = useGridPrivateApiContext();
  const rootProps = useGridRootProps();
  const visibleColumns = useGridSelector(apiRef, gridVisibleColumnDefinitionsSelector);
  const accessibleRowCount = useGridSelector(apiRef, gridExpandedRowCountSelector);
  const headerGroupingMaxDepth = useGridSelector(apiRef, gridColumnGroupsHeaderMaxDepthSelector);
  const pinnedRowsCount = useGridSelector(apiRef, gridVisiblePinnedRowsCountSelector);

  return {
    role: 'grid',
    'aria-colcount': visibleColumns.length,
    'aria-rowcount': headerGroupingMaxDepth + 1 + pinnedRowsCount + accessibleRowCount,
    'aria-multiselectable': isMultipleRowSelectionEnabled(rootProps),
  };
};
