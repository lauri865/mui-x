import { forwardRef } from '@mui/x-internals/forwardRef';
import * as React from 'react';
import { useThemedComponent } from '../context/GridThemeContext';
import {
  gridPageCountSelector,
  gridPaginationModelSelector,
  gridPaginationRowCountSelector,
} from '../hooks/features/pagination/gridPaginationSelector';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';
import { useGridSelector } from '../hooks/utils/useGridSelector';

const defaultLabelDisplayedRows = ({
  from,
  to,
  count,
  estimated,
}: {
  from: number;
  to: number;
  count: number;
  estimated: number | undefined;
}) => {
  if (!estimated) {
    return (
      <span>
        <strong className="font-medium">
          {from}–{to}
        </strong>{' '}
        <span className="text-grid-text/70">of {count !== -1 ? count : `more than ${to}`}</span>
      </span>
    );
  }
  const estimateLabel = estimated && estimated > to ? `around ${estimated}` : `more than ${to}`;
  return (
    <span>
      <strong className="font-medium">
        {from}–{to}
      </strong>{' '}
      of {count !== -1 ? count : estimateLabel}
    </span>
  );
};

const GridPagination = forwardRef<HTMLDivElement>(function GridPagination(props, ref) {
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const paginationModel = useGridSelector(apiRef, gridPaginationModelSelector);
  const rowCount = useGridSelector(apiRef, gridPaginationRowCountSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  const classes = useThemedComponent('pagination');

  const { paginationMode, loading, estimatedRowCount } = rootProps;

  const computedProps = React.useMemo(() => {
    if (rowCount === -1 && paginationMode === 'server' && loading) {
      return {
        backIconButtonProps: { disabled: true },
        nextIconButtonProps: { disabled: true },
      };
    }

    return {};
  }, [loading, paginationMode, rowCount]);

  const lastPage = React.useMemo(() => Math.max(0, pageCount - 1), [pageCount]);

  const computedPage = React.useMemo(() => {
    if (rowCount === -1) {
      return paginationModel.page;
    }
    return paginationModel.page <= lastPage ? paginationModel.page : lastPage;
  }, [lastPage, paginationModel.page, rowCount]);

  const handlePageSizeChange = React.useCallback(
    (value: string) => {
      const pageSize = Number(value);
      apiRef.current.setPageSize(pageSize);
    },
    [apiRef],
  );

  const handlePageChange = React.useCallback(
    (page: number) => {
      apiRef.current.setPage(page);
    },
    [apiRef],
  );

  const isPageSizeIncludedInPageSizeOptions = (pageSize: number) => {
    for (let i = 0; i < rootProps.pageSizeOptions.length; i += 1) {
      const option = rootProps.pageSizeOptions[i];
      if (typeof option === 'number') {
        if (option === pageSize) {
          return true;
        }
      } else if (option.value === pageSize) {
        return true;
      }
    }
    return false;
  };

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const warnedOnceMissingInPageSizeOptions = React.useRef(false);

    const pageSize = rootProps.paginationModel?.pageSize ?? paginationModel.pageSize;
    if (
      !warnedOnceMissingInPageSizeOptions.current &&
      !rootProps.autoPageSize &&
      !isPageSizeIncludedInPageSizeOptions(pageSize)
    ) {
      console.warn(
        [
          `MUI X: The page size \`${paginationModel.pageSize}\` is not present in the \`pageSizeOptions\`.`,
          `Add it to show the pagination select.`,
        ].join('\n'),
      );

      warnedOnceMissingInPageSizeOptions.current = true;
    }
  }

  const pageSizeOptions = isPageSizeIncludedInPageSizeOptions(paginationModel.pageSize)
    ? rootProps.pageSizeOptions
    : [];

  const wrappedLabelDisplayedRows = defaultLabelDisplayedRows({
    from: paginationModel.page * paginationModel.pageSize + 1,
    to: Math.min((paginationModel.page + 1) * paginationModel.pageSize, rowCount),
    count: rowCount,
    estimated: estimatedRowCount,
  });

  const pageNumber = computedPage + 1;
  const Select = rootProps.slots.baseSelect;
  return (
    <div className={classes.root} ref={ref}>
      {pageSizeOptions.length > 1 && (
        <React.Fragment>
          <div className="whitespace-nowrap">
            {apiRef.current.getLocaleText('paginationRowsPerPage')}
          </div>
          <Select.Root
            value={String(paginationModel.pageSize)}
            onValueChange={handlePageSizeChange}
          >
            <Select.Trigger aria-label="Change page size" className="h-7 min-w-[60px]">
              <Select.Value>{paginationModel.pageSize}</Select.Value>
            </Select.Trigger>
            <Select.Content className="min-w-[80px]">
              {pageSizeOptions.map((option, index) => (
                <Select.Item key={index} value={String(option)}>
                  {option.toString()}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </React.Fragment>
      )}
      <Select.Root
        value={String(computedPage)}
        onValueChange={(value) => {
          handlePageChange(Number(value));
        }}
      >
        <Select.Trigger variant="ghost" aria-label="Change page">
          <Select.Value>{wrappedLabelDisplayedRows}</Select.Value>
        </Select.Trigger>
        <Select.Content className="min-w-[80px]" align="center" sideOffset={-8}>
          {Array.from({ length: pageCount }, (_, index) => (
            <Select.Item key={index} value={String(index)}>
              {index + 1}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      <div className={classes.variants.controls}>
        <rootProps.slots.baseIconButton
          disabled={pageNumber <= 1 || computedProps.backIconButtonProps?.disabled}
          onClick={() => handlePageChange(computedPage - 1)}
          aria-label={apiRef.current.getLocaleText('paginationPreviousPage')}
        >
          <rootProps.slots.paginationPrevIcon />
        </rootProps.slots.baseIconButton>
        {/* <span className={classes.variants.page}>
        <strong>{pageNumber}</strong> of <strong>{pageCount}</strong>
      </span> */}
        <rootProps.slots.baseIconButton
          disabled={pageNumber >= pageCount || computedProps.nextIconButtonProps?.disabled}
          onClick={() => handlePageChange(computedPage + 1)}
          aria-label={apiRef.current.getLocaleText('paginationNextPage')}
        >
          <rootProps.slots.paginationNextIcon />
        </rootProps.slots.baseIconButton>
      </div>
    </div>
  );
});

export { GridPagination };
