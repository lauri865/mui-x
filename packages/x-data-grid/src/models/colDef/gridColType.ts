export interface GridColumnTypes {
  string: 'string';
  number: 'number';
  date: 'date';
  dateString: 'dateString';
  dateTime: 'dateTime';
  boolean: 'boolean';
  singleSelect: 'singleSelect';
  actions: 'actions';
  custom: 'custom';
  array: 'array';
}

export type GridColType = GridColumnTypes[keyof GridColumnTypes];
