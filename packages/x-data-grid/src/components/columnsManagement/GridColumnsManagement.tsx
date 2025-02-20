import useEventCallback from '@mui/utils/useEventCallback';
import clsx from 'clsx';
import * as React from 'react';
import { GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD } from '../../colDef';
import { useThemedComponent } from '../../context/GridThemeContext';
import { EMPTY_PINNED_COLUMN_FIELDS } from '../../hooks';
import { getPinnedColumnState } from '../../hooks/features/columnPinning/useGridColumnPinning';
import {
  gridColumnDefinitionsSelector,
  gridColumnFieldsSelector,
  gridColumnVisibilityModelSelector,
  gridPinnedColumnsSelector,
} from '../../hooks/features/columns/gridColumnsSelector';
import { createColumnsState } from '../../hooks/features/columns/gridColumnsUtils';
import { useGridPrivateApiContext } from '../../hooks/utils/useGridPrivateApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { arrayShallowCompare, useGridSelector } from '../../hooks/utils/useGridSelector';
import { useLazyRef } from '../../hooks/utils/useLazyRef';
import type { GridColDef } from '../../models/colDef/gridColDef';
import { TextFieldProps } from '../../models/gridBaseSlots';
import { checkColumnVisibilityModelsSame, defaultSearchPredicate } from './utils';

export interface GridColumnsManagementProps {
  /*
   * Changes how the options in the columns selector should be ordered.
   * If not specified, the order is derived from the `columns` prop.
   */
  sort?: 'asc' | 'desc';
  searchPredicate?: (column: GridColDef, searchValue: string) => boolean;
  searchInputProps?: Partial<TextFieldProps>;
  /**
   * If `true`, the column search field will be focused automatically.
   * If `false`, the first column switch input will be focused automatically.
   * This helps to avoid input keyboard panel to popup automatically on touch devices.
   * @default true
   */
  autoFocusSearchField?: boolean;
  /**
   * If `true`, the `Show/Hide all` toggle checkbox will not be displayed.
   * @default false
   */
  disableShowHideToggle?: boolean;
  /**
   * If `true`, the `Reset` button will not be disabled
   * @default false
   */
  disableResetButton?: boolean;
  /**
   * Changes the behavior of the `Show/Hide All` toggle when the search field is used:
   * - `all`: Will toggle all columns.
   * - `filteredOnly`: Will only toggle columns that match the search criteria.
   * @default 'all'
   */
  toggleAllMode?: 'all' | 'filteredOnly';
  /**
   * Returns the list of togglable columns.
   * If used, only those columns will be displayed in the panel
   * which are passed as the return value of the function.
   * @param {GridColDef[]} columns The `ColDef` list of all columns.
   * @returns {GridColDef['field'][]} The list of togglable columns' field names.
   */
  getTogglableColumns?: (columns: GridColDef[]) => GridColDef['field'][];
}

const collator = new Intl.Collator();

function GridColumnsManagement(props: GridColumnsManagementProps) {
  const apiRef = useGridPrivateApiContext();
  const columns = useGridSelector(apiRef, gridColumnDefinitionsSelector);
  const rootProps = useGridRootProps();
  const initialState = useLazyRef(() =>
    createColumnsState({
      apiRef,
      columnsToUpsert: rootProps.columns,
      initialState: rootProps.initialState?.columns,
      columnVisibilityModel:
        rootProps.columnVisibilityModel ?? rootProps.initialState?.columns?.columnVisibilityModel,
      keepOnlyColumnsToUpsert: true,
      force: true,
    }),
  ).current;
  const initialColumnVisibilityModel = useLazyRef(() => initialState.columnVisibilityModel).current;
  const initialPinnedColumns = useLazyRef(
    () =>
      rootProps.pinnedColumns ??
      rootProps.initialState?.pinnedColumns ??
      EMPTY_PINNED_COLUMN_FIELDS,
  ).current;
  const initalColumnOrder = useLazyRef(() => initialState.orderedFields).current;
  const columnVisibilityModel = useGridSelector(apiRef, gridColumnVisibilityModelSelector);
  const [searchValue, setSearchValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const classes = useThemedComponent('columnsPanel');

  const {
    sort,
    searchPredicate = defaultSearchPredicate,
    autoFocusSearchField = true,
    disableShowHideToggle = false,
    disableResetButton = false,
    toggleAllMode = 'all',
    getTogglableColumns,
    searchInputProps,
  } = props;

  const columnOrder = useGridSelector(apiRef, gridColumnFieldsSelector);
  const isResetDisabled = React.useMemo(
    () =>
      checkColumnVisibilityModelsSame(columnVisibilityModel, initialColumnVisibilityModel) &&
      arrayShallowCompare(initalColumnOrder, columnOrder) &&
      arrayShallowCompare(
        initialPinnedColumns.left,
        gridPinnedColumnsSelector(apiRef.current.state).left,
      ) &&
      arrayShallowCompare(
        initialPinnedColumns.right,
        gridPinnedColumnsSelector(apiRef.current.state).right,
      ),
    [columnVisibilityModel, initialColumnVisibilityModel, columnOrder],
  );

  const sortedColumns = React.useMemo(() => {
    switch (sort) {
      case 'asc':
        return [...columns].sort((a, b) =>
          collator.compare(a.headerName || a.field, b.headerName || b.field),
        );

      case 'desc':
        return [...columns].sort(
          (a, b) => -collator.compare(a.headerName || a.field, b.headerName || b.field),
        );

      default:
        return columns;
    }
  }, [columns, sort]);

  const toggleColumn = (field: string) => (checked: boolean) => {
    apiRef.current.setColumnVisibility(field, checked);
  };

  const currentColumns = React.useMemo(() => {
    const togglableColumns = getTogglableColumns ? getTogglableColumns(sortedColumns) : null;

    const togglableSortedColumns = (
      togglableColumns
        ? sortedColumns.filter(({ field }) => togglableColumns.includes(field))
        : sortedColumns
    ).filter((column) => !column.disableColumnManagement);

    if (!searchValue) {
      return togglableSortedColumns;
    }

    return togglableSortedColumns.filter((column) =>
      searchPredicate(column, searchValue.toLowerCase()),
    );
  }, [sortedColumns, searchValue, searchPredicate, getTogglableColumns]);

  const toggleAllColumns = React.useCallback(
    (isVisible: boolean) => {
      const currentModel = gridColumnVisibilityModelSelector(apiRef);
      const newModel = { ...currentModel };
      const togglableColumns = getTogglableColumns ? getTogglableColumns(columns) : null;

      (toggleAllMode === 'filteredOnly' ? currentColumns : columns).forEach((col) => {
        if (col.hideable && (togglableColumns == null || togglableColumns.includes(col.field))) {
          if (isVisible) {
            // delete the key from the model instead of setting it to `true`
            delete newModel[col.field];
          } else {
            newModel[col.field] = false;
          }
        }
      });

      return apiRef.current.setColumnVisibilityModel(newModel);
    },
    [apiRef, columns, getTogglableColumns, toggleAllMode, currentColumns],
  );

  const handleSearchValueChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(event.target.value);
    },
    [],
  );

  const hideableColumns = React.useMemo(
    () => currentColumns.filter((col) => col.hideable),
    [currentColumns],
  );

  const allHideableColumnsVisible = React.useMemo(
    () =>
      hideableColumns.every(
        (column) =>
          columnVisibilityModel[column.field] == null ||
          columnVisibilityModel[column.field] !== false,
      ),
    [columnVisibilityModel, hideableColumns],
  );

  const allHideableColumnsHidden = React.useMemo(
    () => hideableColumns.every((column) => columnVisibilityModel[column.field] === false),
    [columnVisibilityModel, hideableColumns],
  );

  let firstHideableColumnFound = false;
  const isFirstHideableColumn = (column: GridColDef) => {
    if (firstHideableColumnFound === false && column.hideable !== false) {
      firstHideableColumnFound = true;
      return true;
    }
    return false;
  };

  const reorder = useDragReorder((dragIndex, overIndex) => {
    const pinnedPositionOver = apiRef.current.getColumnPinnedPosition(
      currentColumns[overIndex].field,
    );
    const pinnedPositionDrag = apiRef.current.getColumnPinnedPosition(
      currentColumns[dragIndex].field,
    );
    if (pinnedPositionOver !== pinnedPositionDrag) {
      if (pinnedPositionOver) {
        apiRef.current.pinColumn(currentColumns[dragIndex].field, pinnedPositionOver);
      } else {
        apiRef.current.unpinColumn(currentColumns[dragIndex].field);
      }
    }
    apiRef.current.setColumnIndex(currentColumns[dragIndex].field, overIndex);
  });

  return (
    <React.Fragment>
      <div className={classes.variants.header}>
        <rootProps.slots.baseTextField
          placeholder={apiRef.current.getLocaleText('columnsManagementSearchTitle')}
          className={classes.variants.searchInput}
          value={searchValue}
          onChange={handleSearchValueChange}
          left={<rootProps.slots.quickFilterIcon />}
          right={
            searchValue && (
              <rootProps.slots.baseIconButton
                onClick={() => {
                  setSearchValue('');
                  inputRef.current?.focus();
                }}
                variant="ghost"
              >
                <rootProps.slots.columnMenuClearIcon />
              </rootProps.slots.baseIconButton>
            )
          }
          size="small"
          type="search"
          autoComplete="off"
          ref={inputRef}
          {...rootProps.slotProps?.baseTextField}
          {...searchInputProps}
        />
      </div>
      <div className={clsx(classes.root)} ref={reorder.refs.containerRef}>
        {currentColumns.map((column, index) => (
          <div key={column.field} className="relative group/column">
            {reorder.state.hoverIndex === index &&
              reorder.state.dragIndex !== reorder.state.hoverIndex && (
                <div
                  className={clsx(classes.variants.draggingOverIndicator)}
                  style={{
                    top: reorder.state.hoverIndex < reorder.state.dragIndex! ? '-6px' : undefined,
                    bottom:
                      reorder.state.hoverIndex > reorder.state.dragIndex! ? '-6px' : undefined,
                  }}
                />
              )}
            <rootProps.slots.baseInputLabel
              className={clsx(
                classes.variants.checkboxLabel,
                reorder.state.dragIndex === index && classes.variants.dragging,
              )}
              {...reorder.handlers}
              data-index={index}
            >
              <rootProps.slots.baseCheckbox
                disabled={column.hideable === false}
                checked={columnVisibilityModel[column.field] !== false}
                onCheckedChange={toggleColumn(column.field)}
                name={column.field}
              />
              {column.field === GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD && (
                <rootProps.slots.baseTooltip
                  title={apiRef.current.getLocaleText('unGroupAll')}
                  delay={0}
                  sideOffset={8}
                >
                  <rootProps.slots.groupIcon
                    className="size-4 -mr-1 cursor-pointer"
                    role="button"
                    onPointerDown={(e: any) => {
                      e.stopPropagation();
                    }}
                    onClick={(e: Event) => {
                      e.stopPropagation();
                      e.preventDefault();
                      apiRef.current.setRowGroupingModel([]);
                    }}
                  />
                </rootProps.slots.baseTooltip>
              )}
              {column.headerName || column.field}

              <div className="ml-auto flex items-center">
                {apiRef.current.isColumnPinned(column.field) && (
                  <rootProps.slots.baseTooltip
                    title={apiRef.current.getLocaleText('unpin')}
                    delay={0}
                    sideOffset={8}
                  >
                    <rootProps.slots.pinIcon
                      className={classes.variants.pinIcon}
                      onPointerDown={(e: any) => {
                        e.stopPropagation();
                      }}
                      onClick={(e: any) => {
                        e.stopPropagation();
                        e.preventDefault();
                        apiRef.current.unpinColumn(column.field);
                      }}
                    />
                  </rootProps.slots.baseTooltip>
                )}
                <rootProps.slots.dragHandleIcon className={classes.variants.dragHandle} />
              </div>
            </rootProps.slots.baseInputLabel>
          </div>
        ))}
        {currentColumns.length === 0 && (
          <div className="text-center text-grid-text/50 py-1">
            {apiRef.current.getLocaleText('columnsManagementNoColumns')}
          </div>
        )}
      </div>
      {!disableShowHideToggle || !disableResetButton ? (
        <div className={classes.variants.footer}>
          {!disableShowHideToggle ? (
            <rootProps.slots.baseInputLabel className={classes.variants.checkboxLabel}>
              <rootProps.slots.baseCheckbox
                disabled={hideableColumns.length === 0}
                checked={allHideableColumnsVisible}
                onClick={() => toggleAllColumns(!allHideableColumnsVisible)}
                name={apiRef.current.getLocaleText('columnsManagementShowHideAllText')}
                {...rootProps.slotProps?.baseCheckbox}
              />

              {apiRef.current.getLocaleText('columnsManagementShowHideAllText')}
            </rootProps.slots.baseInputLabel>
          ) : (
            <span />
          )}

          {!disableResetButton ? (
            <rootProps.slots.baseButton
              onClick={() => {
                // first restore pinned columns to make sure resulting order is correct
                apiRef.current.setState((state) => ({
                  ...state,
                  pinnedColumns: getPinnedColumnState(initialPinnedColumns, initialState),
                }));
                const newInitialState = createColumnsState({
                  apiRef,
                  columnsToUpsert: rootProps.columns,
                  initialState: rootProps.initialState?.columns,
                  columnVisibilityModel:
                    rootProps.columnVisibilityModel ??
                    rootProps.initialState?.columns?.columnVisibilityModel,
                  keepOnlyColumnsToUpsert: true,
                  force: true,
                });
                apiRef.current.setState((state) => ({
                  ...state,
                  columns: newInitialState,
                }));
              }}
              disabled={isResetDisabled}
              size="md"
              className={classes.variants.resetButton}
              {...rootProps.slotProps?.baseButton}
            >
              {apiRef.current.getLocaleText('columnsManagementReset')}
            </rootProps.slots.baseButton>
          ) : null}
        </div>
      ) : null}
    </React.Fragment>
  );
}

interface DragReorderHandlers {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
}

export function useDragReorder(onReorder: (dragIndex: number, overIndex: number) => void) {
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  const startY = React.useRef<number | null>(null);

  const getIndex = (e: React.PointerEvent) => {
    const target = e.currentTarget as HTMLElement;
    return Number(target.dataset.index);
  };

  const onKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDragIndex(null);
      setHoverIndex(null);
      startY.current = null;
      window.removeEventListener('keydown', onKeyDown);
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const onPointerUp = useEventCallback((e: PointerEvent) => {
    if (dragIndex != null && hoverIndex != null) {
      e.stopPropagation();
      e.preventDefault();

      if (dragIndex !== hoverIndex) {
        onReorder(dragIndex!, hoverIndex);
      }
    }
    setDragIndex(null);
    setHoverIndex(null);
    startY.current = null;
    window.removeEventListener('keydown', onKeyDown, {
      capture: true,
    });
  });

  const handlers: DragReorderHandlers = {
    onPointerDown: (e) => {
      if (e.button !== 0) {
        return;
      }
      const index = getIndex(e);
      setDragIndex(index);
      startY.current = e.clientY;
      window.addEventListener('pointerup', onPointerUp, {
        once: true,
        capture: true,
      });
      window.addEventListener('keydown', onKeyDown, {
        capture: true,
        once: true,
      });
    },
    onPointerMove: (e) => {
      if (
        dragIndex !== null &&
        startY.current !== null &&
        Math.abs(e.clientY - startY.current) > 5
      ) {
        let index = getIndex(e);

        if (index !== dragIndex) {
          const bbox = e.currentTarget.getBoundingClientRect();
          const y = e.clientY - bbox.top;
          const isBefore = y < bbox.height / 2;
          const draggingBelow = index > dragIndex;
          if (isBefore && draggingBelow) {
            index = Math.max(0, index - 1);
          }
          if (!isBefore && !draggingBelow) {
            index = Math.min(index + 1, ref.current!.children.length - 1);
          }
        }

        setHoverIndex(index);

        if (ref.current) {
          const { top, bottom } = ref.current.getBoundingClientRect();
          if (e.clientY < top + 20) {
            ref.current.scrollBy({ top: -10, behavior: 'smooth' });
          } else if (e.clientY > bottom - 20) {
            ref.current.scrollBy({ top: 10, behavior: 'smooth' });
          }
        }
      }
    },
  };

  return {
    state: { dragIndex, hoverIndex },
    refs: { containerRef: ref },
    handlers,
  };
}

export { GridColumnsManagement };
