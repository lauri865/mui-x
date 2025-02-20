'use client';
import { forwardRef } from '@mui/x-internals/forwardRef';
import * as React from 'react';
import { GridRoot } from '../components';
import { GridContextProvider } from '../context/GridContextProvider';
import { useGridRowAriaAttributes } from '../hooks/features/rows/useGridRowAriaAttributes';
import { useGridAriaAttributes } from '../hooks/utils/useGridAriaAttributes';
import { propValidatorsDataGrid, validateProps } from '../internals/utils/propValidation';
import { GridValidRowModel } from '../models/gridRows';
import { DataGridProps } from '../models/props/DataGridProps';
import { useDataGridComponent } from './useDataGridComponent';
import { useDataGridProps } from './useDataGridProps';

export type { GridSlotsComponent as GridSlots } from '../models';

const configuration = {
  hooks: {
    useGridAriaAttributes,
    useGridRowAriaAttributes,
  },
};

const DataGridRaw = forwardRef(function DataGrid<R extends GridValidRowModel>(
  inProps: DataGridProps<R>,
  ref: React.Ref<HTMLDivElement>,
) {
  const props = useDataGridProps(inProps);
  const privateApiRef = useDataGridComponent(props.apiRef, props);

  if (process.env.NODE_ENV !== 'production') {
    validateProps(props, propValidatorsDataGrid);
  }
  return (
    <GridContextProvider privateApiRef={privateApiRef} configuration={configuration} props={props}>
      <GridRoot
        className={props.className}
        style={props.style}
        {...props.slotProps?.root}
        ref={ref}
      />
    </GridContextProvider>
  );
});

interface DataGridComponent {
  <R extends GridValidRowModel = any>(
    props: DataGridProps<R> & React.RefAttributes<HTMLDivElement>,
  ): React.JSX.Element;
  propTypes?: any;
}

/**
 * Demos:
 * - [DataGrid](https://mui.com/x/react-data-grid/demo/)
 *
 * API:
 * - [DataGrid API](https://mui.com/x/api/data-grid/data-grid/)
 */
const controlledProps: Array<keyof Partial<DataGridProps>> = [
  // primitive controlled props:
  'columnHeaderHeight',
  'density',
  'estimatedRowCount',
  'loading',
  'rowCount',
  'rowHeight',
  'scrollbarSize',

  // complex controlled props:
  'aggregationModel',
  'cellModesModel',
  /* 'cellSelectionModel', */
  'columnVisibilityModel',
  'columnVisibilityModel',
  'detailPanelExpandedRowIds',
  'filterModel',
  /* 'groupingColDef', */
  'paginationMeta',
  'paginationModel',
  'pinnedColumns',
  'pinnedRows',
  'rowGroupingModel',
  'rowModesModel',
  'rowSelectionModel',
  'rowSelectionPropagation',
];

export const DataGrid = React.memo(DataGridRaw, (prev, props) => {
  if (props.disableAutoMemo) {
    return Object.is(prev, props);
  }
  if (props.refreshKey !== prev.refreshKey) {
    return false;
  }
  if (!prev.columns.length && props.columns.length) {
    return false;
  }

  if (props.rows?.length !== prev.rows?.length) {
    return false;
  }
  if (!Object.is(props.rows, prev.rows)) {
    return false;
  }

  if (props.dependencies && prev.dependencies) {
    if (props.dependencies.length !== prev.dependencies.length) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Twgrid]: Dependency array size has changed. This may affect performance.');
      }
      return false;
    }

    for (let i = 0; i < props.dependencies.length; i += 1) {
      if (!Object.is(props.dependencies[i], prev.dependencies[i])) {
        return false;
      }
    }
  } else if (props.dependencies && !prev.dependencies) {
    return false;
  }

  for (let i = 0; i < controlledProps.length; i += 1) {
    const prop = controlledProps[i];
    if (!Object.is(props[prop], prev[prop])) {
      return false;
    }
  }

  return true;
}) as DataGridComponent;
