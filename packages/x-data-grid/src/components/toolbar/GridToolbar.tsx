import * as React from 'react';
import { forwardRef } from '@mui/x-internals/forwardRef';
import {
  GridToolbarContainer,
  GridToolbarContainerProps,
} from '../containers/GridToolbarContainer';
import { GridToolbarColumnsButton } from './GridToolbarColumnsButton';
import { GridToolbarDensitySelector } from './GridToolbarDensitySelector';
import { GridToolbarFilterButton } from './GridToolbarFilterButton';
import { GridToolbarExport, GridToolbarExportProps } from './GridToolbarExport';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { GridToolbarQuickFilter, GridToolbarQuickFilterProps } from './GridToolbarQuickFilter';

export interface GridToolbarProps extends GridToolbarContainerProps, GridToolbarExportProps {
  /**
   * Show the quick filter component.
   * @default false
   */
  showQuickFilter?: boolean;
  /**
   * Props passed to the quick filter component.
   */
  quickFilterProps?: GridToolbarQuickFilterProps;
}

const GridToolbar = forwardRef<HTMLDivElement, GridToolbarProps>(function GridToolbar(props, ref) {
  // TODO v7: think about where export option should be passed.
  // from slotProps={{ toolbarExport: { ...exportOption } }} seems to be more appropriate
  const {
    className,
    csvOptions,
    printOptions,
    excelOptions,
    showQuickFilter = false,
    quickFilterProps = {},
    ...other
  } = props as typeof props & { excelOptions: any };
  const rootProps = useGridRootProps();

  if (
    rootProps.disableColumnFilter &&
    rootProps.disableColumnSelector &&
    rootProps.disableDensitySelector &&
    !showQuickFilter
  ) {
    return null;
  }

  return (
    <GridToolbarContainer {...other} ref={ref}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport
        csvOptions={csvOptions}
        printOptions={printOptions}
        // @ts-ignore
        excelOptions={excelOptions}
      />
      <div style={{ flex: 1 }} />
      {showQuickFilter && <GridToolbarQuickFilter {...quickFilterProps} />}
    </GridToolbarContainer>
  );
});

export { GridToolbar };
