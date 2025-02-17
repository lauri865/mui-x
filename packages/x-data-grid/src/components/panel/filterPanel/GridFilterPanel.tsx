import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import * as React from 'react';
import {
  gridFilterableColumnDefinitionsSelector,
  gridFilterableColumnLookupSelector,
} from '../../../hooks/features/columns/gridColumnsSelector';
import {
  gridFilterActiveItemsLookupSelector,
  gridFilterModelSelector,
} from '../../../hooks/features/filter/gridFilterSelector';
import { useGridApiContext } from '../../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../../hooks/utils/useGridRootProps';
import { useGridSelector } from '../../../hooks/utils/useGridSelector';
import { GridColDef, GridStateColDef } from '../../../models/colDef/gridColDef';
import { GridFilterItem, GridLogicOperator } from '../../../models/gridFilterItem';
import { GridPanelFooter } from '../GridPanelFooter';
import { GridFilterForm, GridFilterFormProps } from './GridFilterForm';

export interface GetColumnForNewFilterArgs {
  currentFilters: GridFilterItem[];
  columns: GridStateColDef[];
}

export interface GridFilterPanelProps
  extends Pick<GridFilterFormProps, 'logicOperators' | 'columnsSort'> {
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  /**
   * Function that returns the next filter item to be picked as default filter.
   * @param {GetColumnForNewFilterArgs} args Currently configured filters and columns.
   * @returns {GridColDef['field']} The field to be used for the next filter or `null` to prevent adding a filter.
   */
  getColumnForNewFilter?: (args: GetColumnForNewFilterArgs) => GridColDef['field'] | null;
  /**
   * Props passed to each filter form.
   */
  filterFormProps?: Pick<
    GridFilterFormProps,
    | 'columnsSort'
    | 'deleteIconProps'
    | 'logicOperatorInputProps'
    | 'operatorInputProps'
    | 'columnInputProps'
    | 'valueInputProps'
    | 'filterColumns'
  >;

  /**
   * If `true`, the `Add filter` button will not be displayed.
   * @default false
   */
  disableAddFilterButton?: boolean;
  /**
   * If `true`, the `Remove all` button will be disabled
   * @default false
   */
  disableRemoveAllButton?: boolean;
  /**
   * @ignore - do not document.
   */
  children?: React.ReactNode;
}

const getGridFilter = (col: GridStateColDef): GridFilterItem => ({
  field: col.field,
  operator: col.filterOperators![0].value,
  id: Math.round(Math.random() * 1e5),
});

const GridFilterPanel = forwardRef<HTMLDivElement, GridFilterPanelProps>(
  function GridFilterPanel(props, ref) {
    const apiRef = useGridApiContext();
    const rootProps = useGridRootProps();
    const filterModel = useGridSelector(apiRef, gridFilterModelSelector);
    const filterableColumns = useGridSelector(apiRef, gridFilterableColumnDefinitionsSelector);
    const filterColumnLookup = useGridSelector(apiRef, gridFilterActiveItemsLookupSelector);
    const filterableColumnsLookup = useGridSelector(apiRef, gridFilterableColumnLookupSelector);
    const lastFilterRef = React.useRef<any>(null);
    const placeholderFilter = React.useRef<GridFilterItem | null>(null);
    console.log('props', props);

    const {
      logicOperators = [GridLogicOperator.And, GridLogicOperator.Or],
      columnsSort,
      filterFormProps,
      getColumnForNewFilter,
      children,
      disableAddFilterButton = false,
      disableRemoveAllButton = false,
      ...other
    } = props;

    const applyFilter = apiRef.current.upsertFilterItem;

    const applyFilterLogicOperator = React.useCallback(
      (operator: GridLogicOperator) => {
        apiRef.current.setFilterLogicOperator(operator);
      },
      [apiRef],
    );

    const getDefaultFilter = React.useCallback((): GridFilterItem | null => {
      let nextColumnWithOperator;
      if (getColumnForNewFilter && typeof getColumnForNewFilter === 'function') {
        // To allow override the column for default (first) filter
        const nextFieldName = getColumnForNewFilter({
          currentFilters: filterModel?.items || [],
          columns: filterableColumns,
        });

        if (nextFieldName === null) {
          return null;
        }

        nextColumnWithOperator = filterableColumns.find(({ field }) => field === nextFieldName);
      } else {
        nextColumnWithOperator = filterableColumns.find((colDef) => colDef.filterOperators?.length);
      }

      if (!nextColumnWithOperator) {
        return null;
      }

      return getGridFilter(nextColumnWithOperator);
    }, [filterModel?.items, filterableColumns, getColumnForNewFilter]);

    const getNewFilter = React.useCallback((): GridFilterItem | null => {
      if (getColumnForNewFilter === undefined || typeof getColumnForNewFilter !== 'function') {
        return getDefaultFilter();
      }

      const currentFilters = filterModel.items.length
        ? filterModel.items
        : [getDefaultFilter()].filter(Boolean);

      // If no items are there in filterModel, we have to pass defaultFilter
      const nextColumnFieldName = getColumnForNewFilter({
        currentFilters: currentFilters as GridFilterItem[],
        columns: filterableColumns,
      });

      if (nextColumnFieldName === null) {
        return null;
      }

      const nextColumnWithOperator = filterableColumns.find(
        ({ field }) => field === nextColumnFieldName,
      );

      if (!nextColumnWithOperator) {
        return null;
      }

      return getGridFilter(nextColumnWithOperator);
    }, [filterModel.items, filterableColumns, getColumnForNewFilter, getDefaultFilter]);

    const items = React.useMemo<GridFilterItem[]>(() => {
      if (filterModel.items.length) {
        return filterModel.items;
      }

      if (!placeholderFilter.current) {
        placeholderFilter.current = getDefaultFilter();
      }

      return placeholderFilter.current ? [placeholderFilter.current] : [];
    }, [filterModel.items, getDefaultFilter]);

    const hasMultipleFilters = items.length > 1;

    const { readOnlyFilters, validFilters } = React.useMemo<{
      readOnlyFilters: GridFilterItem[];
      validFilters: GridFilterItem[];
    }>(
      () =>
        items.reduce(
          (acc, item) => {
            if (filterableColumnsLookup[item.field]) {
              acc.validFilters.push(item);
            } else {
              acc.readOnlyFilters.push(item);
            }
            return acc;
          },
          { readOnlyFilters: [] as GridFilterItem[], validFilters: [] as GridFilterItem[] },
        ),
      [items, filterableColumnsLookup],
    );

    const addNewFilter = React.useCallback(() => {
      const newFilter = getNewFilter();
      if (!newFilter) {
        return;
      }
      apiRef.current.upsertFilterItems([...items, newFilter]);
    }, [apiRef, getNewFilter, items]);

    const deleteFilter = React.useCallback(
      (item: GridFilterItem) => {
        const shouldCloseFilterPanel = validFilters.length === 1;
        apiRef.current.deleteFilterItem(item);
        if (shouldCloseFilterPanel) {
          apiRef.current.hideFilterPanel();
        }
      },
      [apiRef, validFilters.length],
    );

    const handleRemoveAll = React.useCallback(() => {
      apiRef.current.setFilterModel(
        { ...filterModel, items: readOnlyFilters },
        'removeAllFilterItems',
      );
      return apiRef.current.hideFilterPanel();
    }, [apiRef, readOnlyFilters, filterModel, validFilters]);

    React.useEffect(() => {
      if (
        logicOperators.length > 0 &&
        filterModel.logicOperator &&
        !logicOperators.includes(filterModel.logicOperator)
      ) {
        applyFilterLogicOperator(logicOperators[0]);
      }
    }, [logicOperators, applyFilterLogicOperator, filterModel.logicOperator]);

    React.useEffect(() => {
      if (validFilters.length > 0) {
        lastFilterRef.current!.focus();
      }
    }, [validFilters.length]);

    console.log('validFilters', validFilters);

    return (
      <>
        <div className={clsx('overflow-auto max-h-[400px]')}>
          {readOnlyFilters.map((item, index) => (
            <GridFilterForm
              key={item.id == null ? index : item.id}
              item={item}
              applyFilterChanges={applyFilter}
              deleteFilter={deleteFilter}
              hasMultipleFilters={hasMultipleFilters}
              showMultiFilterOperators={index > 0}
              disableMultiFilterOperator={index !== 1}
              applyMultiFilterOperatorChanges={applyFilterLogicOperator}
              focusElementRef={null}
              readOnly
              logicOperators={logicOperators}
              columnsSort={columnsSort}
              index={index}
              {...filterFormProps}
            />
          ))}
          {validFilters.map((item, index) => (
            <GridFilterForm
              key={item.id == null ? index + readOnlyFilters.length : item.id}
              item={item}
              applyFilterChanges={applyFilter}
              deleteFilter={deleteFilter}
              hasMultipleFilters={hasMultipleFilters}
              showMultiFilterOperators={readOnlyFilters.length + index > 0}
              disableMultiFilterOperator={readOnlyFilters.length + index !== 1}
              applyMultiFilterOperatorChanges={applyFilterLogicOperator}
              focusElementRef={index === validFilters.length - 1 ? lastFilterRef : null}
              logicOperators={logicOperators}
              columnsSort={columnsSort}
              index={index}
              {...filterFormProps}
            />
          ))}
        </div>
        {!rootProps.disableMultipleColumnsFiltering &&
        !(disableAddFilterButton && disableRemoveAllButton) ? (
          <GridPanelFooter>
            {!disableAddFilterButton ? (
              <rootProps.slots.baseButton
                onClick={addNewFilter}
                size="sm"
                variant="outline"
                {...rootProps.slotProps?.baseButton}
              >
                <rootProps.slots.filterPanelAddIcon />
                {apiRef.current.getLocaleText('filterPanelAddFilter')}
              </rootProps.slots.baseButton>
            ) : (
              <span />
            )}

            {!disableRemoveAllButton && filterColumnLookup[validFilters[0]?.field] ? (
              <rootProps.slots.baseButton
                size="sm"
                variant="secondary"
                onClick={handleRemoveAll}
                {...rootProps.slotProps?.baseButton}
              >
                <rootProps.slots.filterPanelRemoveAllIcon />
                {apiRef.current.getLocaleText('filterPanelRemoveAll')}
              </rootProps.slots.baseButton>
            ) : null}
          </GridPanelFooter>
        ) : null}
      </>
    );
  },
);

/**
 * Demos:
 * - [Filtering - overview](https://mui.com/x/react-data-grid/filtering/)
 *
 * API:
 * - [GridFilterPanel API](https://mui.com/x/api/data-grid/grid-filter-panel/)
 */
export { getGridFilter, GridFilterPanel };
