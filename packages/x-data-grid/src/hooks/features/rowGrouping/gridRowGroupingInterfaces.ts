export type GridRowGroupingModel = string[];

export interface GridRowGroupingApi {
  addRowGroupingCriteria: (groupingCriteriaField: string, groupingIndex?: number) => void;
  removeRowGroupingCriteria: (groupingCriteriaField: string) => void;
  setRowGroupingCriteriaIndex: (groupingCriteriaField: string, groupingIndex: number) => void;
  setRowGroupingModel: (model: GridRowGroupingModel) => void;
}

export interface GridRowGroupingState {
  model: GridRowGroupingModel;
}

export interface GridRowGroupingInitialState {
  model?: GridRowGroupingModel;
}
