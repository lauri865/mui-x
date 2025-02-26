import { RefObject } from '@mui/x-internals/types';
import * as React from 'react';
import { GridCsvExportMenuItem, GridExportDisplayOptions } from '../../../components/toolbar';
import { GridPrivateApi } from '../../../models/api/gridApiCommunity';
import { GridCsvExportApi } from '../../../models/api/gridCsvExportApi';
import { GridCsvExportOptions } from '../../../models/gridExport';
import type { DataGridProcessedProps } from '../../../models/props/DataGridProps';
import { exportAs } from '../../../utils/exportAs';
import { GridPipeProcessor, useGridRegisterPipeProcessor } from '../../core/pipeProcessing';
import { useGridApiMethod } from '../../utils/useGridApiMethod';
import { useGridLogger } from '../../utils/useGridLogger';
import { buildCSV } from './serializers/csvSerializer';
import { defaultGetRowsToExport, getColumnsToExport } from './utils';

/**
 * @requires useGridColumns (state)
 * @requires useGridFilter (state)
 * @requires useGridSorting (state)
 * @requires useGridSelection (state)
 * @requires useGridParamsApi (method)
 */
export const useGridCsvExport = (
  apiRef: RefObject<GridPrivateApi>,
  props: Pick<DataGridProcessedProps, 'ignoreValueFormatterDuringExport'>,
): void => {
  const logger = useGridLogger(apiRef, 'useGridCsvExport');

  const ignoreValueFormatterProp = props.ignoreValueFormatterDuringExport;
  const ignoreValueFormatter =
    (typeof ignoreValueFormatterProp === 'object'
      ? ignoreValueFormatterProp?.csvExport
      : ignoreValueFormatterProp) || false;

  const getDataAsCsv = React.useCallback<GridCsvExportApi['getDataAsCsv']>(
    (options = {}) => {
      logger.debug(`Get data as CSV`);

      const exportedColumns = getColumnsToExport({
        apiRef,
        options,
      });

      const getRowsToExport = options.getRowsToExport ?? defaultGetRowsToExport;
      const exportedRowIds = getRowsToExport({ apiRef });

      return buildCSV({
        columns: exportedColumns,
        rowIds: exportedRowIds,
        csvOptions: {
          delimiter: options.delimiter || ',',
          shouldAppendQuotes: options.shouldAppendQuotes ?? true,
          includeHeaders: options.includeHeaders ?? true,
          includeColumnGroupsHeaders: options.includeColumnGroupsHeaders ?? true,
          escapeFormulas: options.escapeFormulas ?? true,
        },
        ignoreValueFormatter,
        apiRef,
      });
    },
    [logger, apiRef, ignoreValueFormatter],
  );

  const exportDataAsCsv = React.useCallback<GridCsvExportApi['exportDataAsCsv']>(
    (options): void => {
      logger.debug(`Export data as CSV`);
      const csv = getDataAsCsv(options);

      const blob = new Blob([options?.utf8WithBom ? new Uint8Array([0xef, 0xbb, 0xbf]) : '', csv], {
        type: 'text/csv',
      });

      exportAs(blob, 'csv', options?.fileName);
    },
    [logger, getDataAsCsv],
  );

  const csvExportApi: GridCsvExportApi = {
    getDataAsCsv,
    exportDataAsCsv,
  };

  useGridApiMethod(apiRef, csvExportApi, 'public');

  /**
   * PRE-PROCESSING
   */
  const addExportMenuButtons = React.useCallback<GridPipeProcessor<'exportMenu'>>(
    (initialValue, options: { csvOptions: GridCsvExportOptions & GridExportDisplayOptions }) => {
      if (options.csvOptions?.disableToolbarButton) {
        return initialValue;
      }
      return [
        ...initialValue,
        {
          component: <GridCsvExportMenuItem options={options.csvOptions} />,
          componentName: 'csvExport',
        },
      ];
    },
    [],
  );

  useGridRegisterPipeProcessor(apiRef, 'exportMenu', addExportMenuButtons);
};
