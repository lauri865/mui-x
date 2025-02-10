'use client';;
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
export const DataGrid = React.memo(DataGridRaw) as DataGridComponent;
