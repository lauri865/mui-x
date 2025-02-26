export function slugifyInterfaceName(name: string): string {
  return name
    .replace(/^Grid/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Convert camelCase to kebab-case
    .replace(/[_\s]+/g, '-') // Replace underscores/spaces with dashes
    .toLowerCase();
}

export const components = ['DataGrid'] as const;
export const interfaces = [
  'GridApi',
  'GridEvents',
  'GridInitialState',
  // Cols
  'GridColDef',
  'GridSingleSelectColDef',
  'GridActionsColDef',
  'GridListColDef',
  'GridAutosizeOptions',
  // Rendering
  'GridCellParams',
  'GridRowParams',
  'GridRowClassNameParams',
  'GridRowSpacingParams',
  // RowGrouping
  //'GridRowGroupingModel',
  // Filtering
  'GridFilterModel',
  'GridFilterCondition',
  'GridFilterItem',
  'GridFilterOperator',
  // Aggregation
  'GridAggregationFunction',
  // Exporting
  'GridExportStateParams',
  'GridCsvExportOptions',
  'GridPrintExportOptions',
] as const;

export const allInterfaces = [...components, ...interfaces];

export const replaceTokens = [
  // Components can be JSX tags or refer to their props
  ...components.map((c) => [c, `<${c} />`, `${c}Props`, `${c}Component`]).flat(),
  ...interfaces,
] as const;
