import { GridCallbackDetails, GridColDef, GridRowId, GridValueFormatter } from '../../../models';

export interface GridAggregationColdef {
  aggregable?: boolean;
}

export type GridAggregationLookup = {
  [rowId: GridRowId]: number | string | Date | boolean | null | undefined;
};

export interface GridAggregationState {
  model: GridAggregationModel;
  lookup: GridAggregationLookup;
}

export interface GridAggregationInitialState {
  model?: GridAggregationModel;
}

export interface GridAggregationApi {
  setAggregationModel: (model: GridAggregationModel) => void;
}

export interface GridAggregationPrivateApi {
  applyAggregation: () => void;
}

interface GridAggregationFunctionCommon {
  label?: string;
  footerLabel?: string;
  columnTypes?: string[];
  valueFormatter?: GridValueFormatter;
  hasCellUnit?: boolean;
}

export type GridAggregationFunction<ReturnValue = any, V = ReturnValue> =
  | (GridAggregationFunctionCommon & {
      reduce: (params: GridAggregationApplierParams<V>) => ReturnValue;
    })
  | (GridAggregationFunctionCommon & {
      apply: (params: GridAggregationApplierParams<V>) => ReturnValue;
    });

export interface GridAggregationApplierParams<V = any> {
  values: (V | undefined)[];
  groupId: GridRowId;
  field: GridColDef['field'];
}

export type GridAggregationModel = {
  [field: string]: string;
};

export interface GridAggregationRule {
  aggregationFunctionName: string;
  aggregationFunction: GridAggregationFunction;
}

export type GridAggregationRules = { [field: string]: GridAggregationRule };

export interface GridAggregationProps {
  aggregationModel?: GridAggregationModel;
  aggregationFunctions?: Array<GridAggregationFunction>;
  onAggregationModelChange?: (model: GridAggregationModel, detail: GridCallbackDetails) => void;
  showGrandTotals?: boolean;
}
