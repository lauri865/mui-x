import { forwardRef } from '@mui/x-internals/forwardRef';
import * as React from 'react';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { GridCsvExportOptions, GridPrintExportOptions } from '../../models/gridExport';
import { GridToolbarExportContainer } from './GridToolbarExportContainer';

export interface GridExportDisplayOptions {
  /**
   * If `true`, this export option will be removed from the GridToolbarExport menu.
   * @default false
   */
  disableToolbarButton?: boolean;
}

export interface GridExportMenuItemProps<Options extends {}> {
  hideMenu?: () => void;
  options?: Options & GridExportDisplayOptions;
}

export type GridCsvExportMenuItemProps = GridExportMenuItemProps<GridCsvExportOptions>;

export type GridPrintExportMenuItemProps = GridExportMenuItemProps<GridPrintExportOptions>;

export interface GridToolbarExportProps {
  csvOptions?: GridCsvExportOptions & GridExportDisplayOptions;
  printOptions?: GridPrintExportOptions & GridExportDisplayOptions;
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps?: { button?: any; tooltip?: any };
  // TODO v8: Remove this loophole
  // Refactored from: [key: string]: any;
  [x: `data-${string}`]: string;
}

function GridCsvExportMenuItem(props: GridCsvExportMenuItemProps) {
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const { hideMenu, options, ...other } = props;

  return (
    <rootProps.slots.baseMenuItem
      onClick={() => {
        apiRef.current.exportDataAsCsv(options);
        hideMenu?.();
      }}
      {...other}
    >
      {apiRef.current.getLocaleText('toolbarExportCSV')}
    </rootProps.slots.baseMenuItem>
  );
}

function GridPrintExportMenuItem(props: GridPrintExportMenuItemProps) {
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const { hideMenu, options, ...other } = props;

  return (
    <rootProps.slots.baseMenuItem
      onClick={() => {
        apiRef.current.exportDataAsPrint(options);
        hideMenu?.();
      }}
      {...other}
    >
      {apiRef.current.getLocaleText('toolbarExportPrint')}
    </rootProps.slots.baseMenuItem>
  );
}

const GridToolbarExport = forwardRef<HTMLButtonElement, GridToolbarExportProps>(
  function GridToolbarExport(props, ref) {
    const {
      csvOptions = {},
      printOptions = {},
      excelOptions,
      ...other
    } = props as typeof props & { excelOptions: any };

    const apiRef = useGridApiContext();

    const preProcessedButtons = apiRef.current
      .unstable_applyPipeProcessors('exportMenu', [], { excelOptions, csvOptions, printOptions })
      .sort((a, b) => (a.componentName > b.componentName ? 1 : -1));

    if (preProcessedButtons.length === 0) {
      return null;
    }

    return (
      <GridToolbarExportContainer {...other} ref={ref}>
        {preProcessedButtons.map((button, index) =>
          React.cloneElement(button.component, { key: index }),
        )}
      </GridToolbarExportContainer>
    );
  },
);

export { GridCsvExportMenuItem, GridPrintExportMenuItem, GridToolbarExport };
