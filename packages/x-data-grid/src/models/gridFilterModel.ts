import { GridFilterItem, GridLogicOperator } from './gridFilterItem';

/**
 * Model describing the filters to apply to the grid.
 * @demos
 *   - [Pass filters to the grid](/x/react-data-grid/filtering/#pass-filters-to-the-data-grid)
 */
export interface GridFilterModel {
  /**
   * Array of filter items of type `GridFilterItem`
   * @default []
   */
  items: GridFilterItem[];
  /**
   * - `GridLogicOperator.And`: the row must pass all the filter items.
   * - `GridLogicOperator.Or`: the row must pass at least on filter item.
   * @default GridLogicOperator.And
   */
  logicOperator?: 'and' | 'or';
  /**
   * values used to quick filter rows
   * @default []
   */
  quickFilterValues?: any[];
  /**
   * - `GridLogicOperator.And`: the row must pass all the values.
   * - `GridLogicOperator.Or`: the row must pass at least one value.
   * @default GridLogicOperator.And
   */
  quickFilterLogicOperator?: GridLogicOperator;
  /**
   * If `false`, the quick filter will also consider cell values from hidden columns.
   * @default true
   */
  quickFilterExcludeHiddenColumns?: boolean;
}
