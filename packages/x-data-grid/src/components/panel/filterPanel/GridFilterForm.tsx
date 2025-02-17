import { unstable_capitalize as capitalize } from '@mui/utils';
import { forwardRef } from '@mui/x-internals/forwardRef';
import * as React from 'react';
import { gridFilterModelSelector } from '../../../hooks/features/filter/gridFilterSelector';
import { useGridApiContext } from '../../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../../hooks/utils/useGridRootProps';
import { useGridSelector } from '../../../hooks/utils/useGridSelector';
import { GridColDef, GridStateColDef } from '../../../models/colDef/gridColDef';
import { GridFilterItem, GridLogicOperator } from '../../../models/gridFilterItem';

export interface FilterColumnsArgs {
  field: GridColDef['field'];
  columns: GridStateColDef[];
  currentFilters: GridFilterItem[];
}

export interface GridFilterFormProps {
  /**
   * The [[GridFilterItem]] representing this form.
   */
  item: GridFilterItem;
  /**
   * If `true`, the logic operator field is rendered.
   * The field will be invisible if `showMultiFilterOperators` is also `true`.
   */
  hasMultipleFilters: boolean;
  /**
   * If `true`, the logic operator field is visible.
   */
  showMultiFilterOperators?: boolean;
  /**
   * If `true`, disables the logic operator field but still renders it.
   */
  disableMultiFilterOperator?: boolean;
  /**
   * A ref allowing to set imperative focus.
   * It can be passed to the el
   */
  focusElementRef?: React.Ref<any>;
  /**
   * Callback called when the operator, column field or value is changed.
   * @param {GridFilterItem} item The updated [[GridFilterItem]].
   */
  applyFilterChanges: (item: GridFilterItem) => void;
  /**
   * Callback called when the logic operator is changed.
   * @param {GridLogicOperator} operator The new logic operator.
   */
  applyMultiFilterOperatorChanges: (operator: GridLogicOperator) => void;
  /**
   * Callback called when the delete button is clicked.
   * @param {GridFilterItem} item The deleted [[GridFilterItem]].
   */
  deleteFilter: (item: GridFilterItem) => void;
  /**
   * Allows to filter the columns displayed in the filter form.
   * @param {FilterColumnsArgs} args The columns of the grid and name of field.
   * @returns {GridColDef['field'][]} The filtered fields array.
   */
  filterColumns?: (args: FilterColumnsArgs) => GridColDef['field'][];
  /**
   * Sets the available logic operators.
   * @default [GridLogicOperator.And, GridLogicOperator.Or]
   */
  logicOperators?: GridLogicOperator[];
  /**
   * Changes how the options in the columns selector should be ordered.
   * If not specified, the order is derived from the `columns` prop.
   */
  columnsSort?: 'asc' | 'desc';
  /**
   * Props passed to the delete icon.
   * @default {}
   */
  deleteIconProps?: any;
  /**
   * Props passed to the logic operator input component.
   * @default {}
   */
  logicOperatorInputProps?: any;
  /**
   * Props passed to the operator input component.
   * @default {}
   */
  operatorInputProps?: any;
  /**
   * Props passed to the column input component.
   * @default {}
   */
  columnInputProps?: any;
  /**
   * `true` if the filter is disabled/read only.
   * i.e. `colDef.fiterable = false` but passed in `filterModel`
   * @default false
   */
  readOnly?: boolean;
  /**
   * Props passed to the value input component.
   * @default {}
   */
  valueInputProps?: any;
  index: number;
  /**
   * @ignore - do not document.
   */
  children?: React.ReactNode;
}

const getLogicOperatorLocaleKey = (logicOperator: GridLogicOperator) => {
  switch (logicOperator) {
    case GridLogicOperator.And:
      return 'filterPanelOperatorAnd';
    case GridLogicOperator.Or:
      return 'filterPanelOperatorOr';
    default:
      throw new Error('MUI X: Invalid `logicOperator` property in the `GridFilterPanel`.');
  }
};

const getColumnLabel = (col: GridColDef) => col.headerName || col.field;

const collator = new Intl.Collator();

const GridFilterForm = forwardRef<HTMLDivElement, GridFilterFormProps>(
  function GridFilterForm(props, ref) {
    const {
      item,
      hasMultipleFilters,
      deleteFilter,
      applyFilterChanges,
      showMultiFilterOperators,
      disableMultiFilterOperator,
      applyMultiFilterOperatorChanges,
      focusElementRef,
      logicOperators = [GridLogicOperator.And, GridLogicOperator.Or],
      columnsSort,
      filterColumns,
      deleteIconProps = {},
      logicOperatorInputProps = {},
      operatorInputProps = {},
      columnInputProps = {},
      valueInputProps = {},
      readOnly,
      children,
      ...other
    } = props;
    const apiRef = useGridApiContext();
    const filterModel = useGridSelector(apiRef, gridFilterModelSelector);
    const rootProps = useGridRootProps();
    const valueRef = React.useRef<any>(null);
    const filterSelectorRef = React.useRef<HTMLInputElement>(null);
    const multiFilterOperator = filterModel.logicOperator ?? GridLogicOperator.And;

    const hasLogicOperatorColumn: boolean = hasMultipleFilters && logicOperators.length > 0;

    const { InputComponentProps } = valueInputProps;

    const currentColumn = item.field ? apiRef.current.getColumn(item.field) : null;

    const currentOperator = React.useMemo(() => {
      if (!item.operator || !currentColumn) {
        return null;
      }

      return currentColumn.filterOperators?.find((operator) => operator.value === item.operator);
    }, [item, currentColumn]);

    const changeOperator = React.useCallback(
      (operator: string) => {
        const newOperator = currentColumn?.filterOperators!.find((op) => op.value === operator);

        const eraseItemValue =
          !newOperator?.InputComponent ||
          newOperator?.InputComponent !== currentOperator?.InputComponent;

        applyFilterChanges({
          ...item,
          operator,
          value: eraseItemValue ? undefined : item.value,
        });
      },
      [applyFilterChanges, item, currentColumn, currentOperator],
    );

    const handleDeleteFilter = () => {
      deleteFilter(item);
    };

    React.useImperativeHandle(
      focusElementRef,
      () => ({
        focus: () => {
          if (currentOperator?.InputComponent) {
            valueRef?.current?.focus();
          } else {
            filterSelectorRef.current!.focus();
          }
        },
      }),
      [currentOperator],
    );

    const Select = rootProps.slots.baseSelect;

    return (
      <div
        className="flex flex-col gap-2 w-[240px] p-cell border-b last:border-b-0"
        data-id={item.id}
        {...other}
        ref={ref}
      >
        {showMultiFilterOperators && hasLogicOperatorColumn && (
          <Select.Root
            value={multiFilterOperator ?? ''}
            onValueChange={(value) => {
              applyMultiFilterOperatorChanges(value as GridLogicOperator);
            }}
            disabled={readOnly || !!disableMultiFilterOperator || logicOperators.length === 1}
          >
            <Select.Trigger>
              <Select.Value
                placeholder={apiRef.current.getLocaleText('filterPanelLogicOperator')}
              />
            </Select.Trigger>
            <Select.Content>
              {logicOperators.map((logicOperator) => (
                <Select.Item key={logicOperator.toString()} value={logicOperator.toString()}>
                  {apiRef.current.getLocaleText(getLogicOperatorLocaleKey(logicOperator))}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        )}

        <Select.Root value={item.operator} disabled={readOnly} onValueChange={changeOperator}>
          <Select.Trigger className="capitalize">
            <Select.Value placeholder={apiRef.current.getLocaleText('filterPanelOperator')} />
          </Select.Trigger>
          <Select.Content>
            {currentColumn?.filterOperators?.map((operator) => (
              <Select.Item key={operator.value} value={operator.value} className="capitalize">
                {operator.label ||
                  apiRef.current.getLocaleText(
                    `filterOperator${capitalize(operator.value)}` as 'filterOperatorContains',
                  )}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        {currentOperator?.InputComponent ? (
          <currentOperator.InputComponent
            apiRef={apiRef}
            item={item}
            applyValue={applyFilterChanges}
            focusElementRef={valueRef}
            disabled={readOnly}
            left={<rootProps.slots.quickFilterIcon />}
            right={
              (props.item.value != null || props.index > 0) && (
                <rootProps.slots.baseIconButton
                  aria-label={apiRef.current.getLocaleText('filterPanelDeleteIconLabel')}
                  title={apiRef.current.getLocaleText('filterPanelDeleteIconLabel')}
                  onClick={handleDeleteFilter}
                  size="icon"
                  disabled={readOnly}
                  className="text-grid-text/50"
                  {...rootProps.slotProps?.baseIconButton}
                >
                  <rootProps.slots.filterPanelDeleteIcon />
                </rootProps.slots.baseIconButton>
              )
            }
            key={item.field}
            {...currentOperator.InputComponentProps}
            {...InputComponentProps}
          />
        ) : null}
      </div>
    );
  },
);

/**
 * Demos:
 * - [Filtering - overview](https://mui.com/x/react-data-grid/filtering/)
 *
 * API:
 * - [GridFilterForm API](https://mui.com/x/api/data-grid/grid-filter-form/)
 */
export { GridFilterForm };
