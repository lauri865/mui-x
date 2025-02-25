export interface GridColumnTypes {
  string: 'string';
  number: 'number';
  date: 'date';
  dateString: 'dateString';
  dateTime: 'dateTime';
  boolean: 'boolean';
  singleSelect: 'singleSelect';
  array: 'array';
  actions: 'actions';
  custom: 'custom';
}

export type GridColType = GridColumnTypes[keyof GridColumnTypes];
