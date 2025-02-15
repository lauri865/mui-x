import { GridApiCommunity } from '../../../internals';
import {
  GridCallbackDetails,
  GridColDef,
  GridRowId,
  GridTreeNode,
  GridValidRowModel,
  GridValueFormatter,
} from '../../../models';

export interface GridAggregationColdef {
  aggregable?: boolean;
}

export type GridAggregationLookup = Map<GridRowId, any>;

export interface GridAggregationState {
  model: GridAggregationModel;
  lookup: GridAggregationLookup;
}

export interface GridAggregationInitialState {
  model?: GridAggregationModel;
}

export interface GridAggregationApi {
  setAggregationModel: (model: GridAggregationModel) => void;
  setColumnAggregation: (field: string, aggregation: string | null) => void;
  getColumnAggregation: (field: string) => {
    aggregation: string;
    function: GridAggregationFunction;
  } | null;
}

export interface GridAggregationPrivateApi {
  applyAggregation: () => void;
  aggregationFunctions: Record<string, GridAggregationFunction>;
}

interface GridAggregationFunctionCommon {
  label?: string;
  footerLabel?: string;
  columnTypes?: string[];
  valueFormatter?: GridValueFormatter;
  hasCellUnit?: boolean;
}

export interface GridAggregationReducerFunction<Value = any, ReturnValue = Value>
  extends GridAggregationFunctionCommon {
  reduce: (
    acc: Value,
    value: Value | null | undefined,
    params: GridAggregationApplierParams<Value> & {
      row: GridValidRowModel;
      rowNode: GridTreeNode;
    },
  ) => Value;
  postReduce?: (
    acc: Value,
    meta: {
      count: number;
    },
    params: GridAggregationApplierParams<Value>,
  ) => ReturnValue;
  apply?: never;
}

export interface GridAggregationApplierFunction<ReturnValue = any, Value = ReturnValue>
  extends GridAggregationFunctionCommon {
  apply: (
    values: (Value | undefined)[],
    params: GridAggregationApplierParams<Value>,
  ) => ReturnValue;
  reduce?: never;
  postReduce?: never;
}

export type GridAggregationFunction =
  | GridAggregationReducerFunction<any>
  | GridAggregationApplierFunction<any>;

export interface GridAggregationApplierParams<Value = any> {
  field: GridColDef['field'];
  api: GridApiCommunity;
}

export type GridAggregationModel = {
  [field: string]: string;
};

export interface GridAggregationProps {
  aggregationModel?: GridAggregationModel;
  aggregationFunctions?: Record<string, GridAggregationFunction>;
  onAggregationModelChange?: (model: GridAggregationModel, detail: GridCallbackDetails) => void;
  showGrandTotals?: boolean;
}
