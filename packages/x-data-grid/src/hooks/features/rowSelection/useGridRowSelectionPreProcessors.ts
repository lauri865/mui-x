import { RefObject } from '@mui/x-internals/types';
import * as React from 'react';
import { GRID_CHECKBOX_SELECTION_COL_DEF, GRID_CHECKBOX_SELECTION_FIELD } from '../../../colDef';
import { GridPrivateApiCommunity } from '../../../models/api/gridApiCommunity';
import {
  GRID_USER_DEFINED_SPECIAL_COLUMN,
  GridColDef,
  GridColDefInternal,
} from '../../../models/colDef/gridColDef';
import { DataGridProcessedProps } from '../../../models/props/DataGridProps';
import { GridPipeProcessor, useGridRegisterPipeProcessor } from '../../core/pipeProcessing';

export const useGridRowSelectionPreProcessors = (
  apiRef: RefObject<GridPrivateApiCommunity>,
  props: DataGridProcessedProps,
) => {
  const updateSelectionColumn = React.useCallback<GridPipeProcessor<'hydrateColumns'>>(
    (columnsState) => {
      const userDefinedCheckbox = (
        columnsState.lookup[GRID_CHECKBOX_SELECTION_FIELD] as GridColDefInternal
      )?.[GRID_USER_DEFINED_SPECIAL_COLUMN]
        ? columnsState.lookup[GRID_CHECKBOX_SELECTION_FIELD]
        : undefined;

      const selectionColumn: GridColDef = {
        ...(userDefinedCheckbox ?? GRID_CHECKBOX_SELECTION_COL_DEF),
        cellClassName: 'twg-cellCheckbox',
        headerClassName: 'twg-columnHeaderCheckbox',
        headerName: apiRef.current.getLocaleText('checkboxSelectionHeaderName'),
      };

      const shouldHaveSelectionColumn =
        props.checkboxSelection || userDefinedCheckbox !== undefined;
      const haveSelectionColumn = columnsState.lookup[GRID_CHECKBOX_SELECTION_FIELD] != null;

      if (shouldHaveSelectionColumn && !haveSelectionColumn) {
        columnsState.lookup[GRID_CHECKBOX_SELECTION_FIELD] = selectionColumn;
        columnsState.orderedFields = [GRID_CHECKBOX_SELECTION_FIELD, ...columnsState.orderedFields];
      } else if (!shouldHaveSelectionColumn && haveSelectionColumn) {
        delete columnsState.lookup[GRID_CHECKBOX_SELECTION_FIELD];
        columnsState.orderedFields = columnsState.orderedFields.filter(
          (field) => field !== GRID_CHECKBOX_SELECTION_FIELD,
        );
      } else if (shouldHaveSelectionColumn && haveSelectionColumn) {
        columnsState.lookup[GRID_CHECKBOX_SELECTION_FIELD] = {
          ...selectionColumn,
          ...columnsState.lookup[GRID_CHECKBOX_SELECTION_FIELD],
          headerName: selectionColumn.headerName,
        };
      }

      return columnsState;
    },
    [apiRef, props.checkboxSelection],
  );

  useGridRegisterPipeProcessor(apiRef, 'hydrateColumns', updateSelectionColumn);
};
