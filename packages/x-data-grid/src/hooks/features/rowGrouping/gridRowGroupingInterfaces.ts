export type GridRowGroupingModel = string[];

export interface GridRowGroupingApi {
  addRowGroupingCriteria: (groupingCriteriaField: string, groupingIndex?: number) => void;
  removeRowGroupingCriteria: (groupingCriteriaField: string) => void;
  setRowGroupingCriteriaIndex: (groupingCriteriaField: string, groupingIndex: number) => void;
  setRowGroupingModel: (model: GridRowGroupingModel) => void;
  setDefaultGroupingExpansionDepth: (depth: number) => void;
}

export interface GridRowGroupingState {
  model: GridRowGroupingModel;
  defaultExpansionDepth: number;
}

export interface GridRowGroupingInitialState {
  model?: GridRowGroupingModel;
  defaultExpansionDepth?: number;
}
