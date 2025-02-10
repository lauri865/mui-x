import * as React from 'react';
import { fastMemo } from '@mui/x-internals/fastMemo';
import { forwardRef } from '@mui/x-internals/forwardRef';
import {
  useGridColumnHeaders,
  UseGridColumnHeadersProps,
} from '../hooks/features/columnHeaders/useGridColumnHeaders';
import { GridBaseColumnHeaders } from './columnHeaders/GridBaseColumnHeaders';

export interface GridColumnHeadersProps
  extends React.HTMLAttributes<HTMLDivElement>,
    UseGridColumnHeadersProps {
  ref?: React.Ref<HTMLDivElement>;
}

const GridColumnHeaders = forwardRef<HTMLDivElement, GridColumnHeadersProps>(
  function GridColumnHeaders(props, ref) {
    const {
      className,
      visibleColumns,
      sortColumnLookup,
      filterColumnLookup,
      columnHeaderTabIndexState,
      columnGroupHeaderTabIndexState,
      columnHeaderFocus,
      columnGroupHeaderFocus,
      headerGroupingMaxDepth,
      columnMenuState,
      columnVisibility,
      columnGroupsHeaderStructure,
      hasOtherElementInTabSequence,
      ...other
    } = props;

    const { getInnerProps, getColumnHeadersRow, getColumnGroupHeadersRows } = useGridColumnHeaders({
      visibleColumns,
      sortColumnLookup,
      filterColumnLookup,
      columnHeaderTabIndexState,
      columnGroupHeaderTabIndexState,
      columnHeaderFocus,
      columnGroupHeaderFocus,
      headerGroupingMaxDepth,
      columnMenuState,
      columnVisibility,
      columnGroupsHeaderStructure,
      hasOtherElementInTabSequence,
    });

    return (
      <GridBaseColumnHeaders {...other} {...getInnerProps()} ref={ref}>
        {getColumnGroupHeadersRows()}
        {getColumnHeadersRow()}
      </GridBaseColumnHeaders>
    );
  },
);

const MemoizedGridColumnHeaders = fastMemo(GridColumnHeaders);

export { MemoizedGridColumnHeaders as GridColumnHeaders };
