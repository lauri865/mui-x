/**
 * Filter item definition interface.
 * @demos
 *   - [Custom filter operator](/x/react-data-grid/filtering/customization/#create-a-custom-operator)
 */
export interface GridFilterCondition {
  /**
   * The filtering value.
   * The operator filtering function will decide for each row if the row values is correct compared to this value.
   */
  value?: any;
  /**
   * The name of the operator we want to apply.
   */
  operator: string;
}

export interface GridFilterItem {
  /**
   * Must be unique.
   * Only useful when the model contains several items.
   */
  id?: number | string;
  /**
   * The column from which we want to filter the rows.
   */
  field: string;
  /**
   * - `GridLogicOperator.And`: the column must pass all the filter items.
   * - `GridLogicOperator.Or`: the column must pass at least on filter item.
   * @default GridLogicOperator.And
   */
  logicOperator?: 'and' | 'or';
  /**
   * The filter conditions to apply on the column.
   */
  conditions: GridFilterCondition[];
  /**
   * If `true`, the filter item cannot be removed by the user.
   */
  readonly?: boolean;
}

enum GridLogicOperator {
  And = 'and',
  Or = 'or',
}

export { GridLogicOperator };
