import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import * as React from 'react';
import { gridPreferencePanelStateSelector } from '../../../hooks';
import {
  gridFilterableColumnDefinitionsSelector,
  gridFilterableColumnLookupSelector,
} from '../../../hooks/features/columns/gridColumnsSelector';
import { gridFilterModelSelector } from '../../../hooks/features/filter/gridFilterSelector';
import { useGridApiContext } from '../../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../../hooks/utils/useGridRootProps';
import { useGridSelector } from '../../../hooks/utils/useGridSelector';
import { GridStateColDef } from '../../../models/colDef/gridColDef';
import { GridFilterItem, GridLogicOperator } from '../../../models/gridFilterItem';
import { GridPanelFooter } from '../GridPanelFooter';
import { GridFilterForm, GridFilterFormProps } from './GridFilterForm';

export interface GridFilterPanelProps
  extends Pick<GridFilterFormProps, 'logicOperators' | 'columnsSort'> {
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
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
  id: Math.round(Math.random() * 1e5),
  logicOperator: GridLogicOperator.Or,
  conditions: [
    {
      operator: col.filterOperators![0].value,
    },
  ],
});

const GridFilterPanel = forwardRef<HTMLDivElement, GridFilterPanelProps>(
  function GridFilterPanel(props, ref) {
    const apiRef = useGridApiContext();
    const rootProps = useGridRootProps();
    const filterModel = useGridSelector(apiRef, gridFilterModelSelector);
    const filterableColumns = useGridSelector(apiRef, gridFilterableColumnDefinitionsSelector);
    const filterableColumnsLookup = useGridSelector(apiRef, gridFilterableColumnLookupSelector);
    const { labelId: field } = gridPreferencePanelStateSelector(apiRef.current.state);
    const lastFilterRef = React.useRef<any>(null);
    const placeholderFilter = React.useRef<GridFilterItem | null>(null);

    const {
      logicOperators = [GridLogicOperator.And, GridLogicOperator.Or],
      columnsSort,
      filterFormProps,
      children,
      disableAddFilterButton = false,
      disableRemoveAllButton = false,
      ...other
    } = props;

    const applyFilter = apiRef.current.upsertFilterItem;

    const getDefaultFilter = React.useCallback((): GridFilterItem | null => {
      let nextColumnWithOperator = filterableColumns.find((colDef) => colDef.field === field);

      if (!nextColumnWithOperator) {
        return null;
      }

      return getGridFilter(nextColumnWithOperator);
    }, [filterableColumns, field]);

    const getNewFilter = React.useCallback((): GridFilterItem | null => {
      return getDefaultFilter();
    }, [filterModel.items, filterableColumns, getDefaultFilter]);

    const items = React.useMemo<GridFilterItem[]>(() => {
      if (filterModel.items.filter((item) => item.field === field).length > 0) {
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
            if (item.field !== field) {
              return acc;
            }
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

    const applyFilterLogicOperator = React.useCallback(
      (filter: GridFilterItem) => (operator: GridLogicOperator) => {
        apiRef.current.upsertFilterItem({ ...filter, logicOperator: operator });
      },
      [apiRef],
    );

    const addNewFilter = React.useCallback(() => {
      const validFilter = validFilters.at(-1);
      if (!validFilter) {
        return;
      }
      apiRef.current.upsertFilterItem({
        ...validFilter,
        conditions: [
          ...validFilter.conditions,
          { operator: validFilter.conditions.at(-1)!.operator },
        ],
      });
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

    const validFilterCount = validFilters.reduce(
      (acc, filter) => acc + filter.conditions.length,
      0,
    );

    React.useEffect(() => {
      if (validFilters.length > 0) {
        lastFilterRef.current?.focus?.();
      }
    }, [validFilterCount]);

    return (
      <>
        <div className={clsx('overflow-auto max-h-[400px]')}>
          {readOnlyFilters.map((filter) =>
            filter.conditions.map((item, index) => (
              <GridFilterForm
                key={filter.id == null ? `readOnly.${index}` : `${filter.id}.${index}`}
                item={item}
                filter={filter}
                applyFilterChanges={() => {
                  // do nothing
                }}
                deleteFilter={() => {
                  // do nothing
                }}
                hasMultipleFilters={hasMultipleFilters}
                showMultiFilterOperators={index > 0}
                disableMultiFilterOperator={index !== 1}
                applyMultiFilterOperatorChanges={applyFilterLogicOperator(filter)}
                focusElementRef={null}
                readOnly
                logicOperators={logicOperators}
                columnsSort={columnsSort}
                index={index}
                {...filterFormProps}
              />
            )),
          )}
          {validFilters.map((filter) =>
            filter.conditions.map((item, index) => (
              <GridFilterForm
                key={filter.id == null ? `valid.${index}` : `${filter.id}.${index}`}
                item={item}
                filter={filter}
                applyFilterChanges={(values) => {
                  console.log('filter', filter);
                  applyFilter({
                    ...filter,
                    conditions: filter.conditions.map((condition, i) =>
                      i === index ? values : condition,
                    ),
                  });
                }}
                deleteFilter={() => {
                  if (index === 0) {
                    deleteFilter(filter);
                  } else {
                    const newFilter = {
                      ...filter,
                      conditions: filter.conditions.filter((_, i) => i !== index),
                    };
                    applyFilter(newFilter);
                  }
                }}
                hasMultipleFilters={filter.conditions.length > 1}
                showMultiFilterOperators={index > 0}
                disableMultiFilterOperator={index !== 1}
                applyMultiFilterOperatorChanges={applyFilterLogicOperator(filter)}
                focusElementRef={index === filter.conditions.length - 1 ? lastFilterRef : null}
                logicOperators={logicOperators}
                columnsSort={columnsSort}
                index={index}
                {...filterFormProps}
              />
            )),
          )}
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

            {!disableRemoveAllButton && validFilterCount > 1 ? (
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
