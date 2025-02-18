import { forwardRef } from '@mui/x-internals/forwardRef';
import { gridFilteredDescendantRowCountSelector } from '../hooks/features/filter/gridFilterSelector';
import { gridTopLevelRowCountSelector } from '../hooks/features/rows/gridRowsSelector';
import { selectedGridRowsCountSelector } from '../hooks/features/rowSelection/gridRowSelectionSelector';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';
import { useGridSelector } from '../hooks/utils/useGridSelector';
import { GridFooterContainer, GridFooterContainerProps } from './containers/GridFooterContainer';
import { GridSelectedRowCount } from './GridSelectedRowCount';

const GridFooter = forwardRef<HTMLDivElement, GridFooterContainerProps>(
  function GridFooter(props, ref) {
    const apiRef = useGridApiContext();
    const rootProps = useGridRootProps();
    const totalTopLevelRowCount = useGridSelector(apiRef, gridTopLevelRowCountSelector);
    const selectedRowCount = useGridSelector(apiRef, selectedGridRowsCountSelector);
    const visibleTopLevelRowCount = useGridSelector(apiRef, gridFilteredDescendantRowCountSelector);

    const selectedRowCountElement =
      !rootProps.hideFooterSelectedRowCount && selectedRowCount > 0 ? (
        <GridSelectedRowCount selectedRowCount={selectedRowCount} />
      ) : null;

    const rowCountElement =
      !rootProps.hideFooterRowCount && !rootProps.pagination ? (
        <rootProps.slots.footerRowCount
          {...rootProps.slotProps?.footerRowCount}
          rowCount={totalTopLevelRowCount}
          visibleRowCount={visibleTopLevelRowCount}
        />
      ) : null;

    const paginationElement = rootProps.pagination &&
      !rootProps.hideFooterPagination &&
      rootProps.slots.pagination && (
        <rootProps.slots.pagination {...rootProps.slotProps?.pagination} />
      );

    return (
      <GridFooterContainer {...props} ref={ref}>
        {rowCountElement}
        {selectedRowCountElement}
        {paginationElement}
      </GridFooterContainer>
    );
  },
);

export { GridFooter };
