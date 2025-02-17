import { unstable_composeClasses as composeClasses, unstable_useId as useId } from '@mui/utils';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { fastMemo } from '@mui/x-internals/fastMemo';
import clsx from 'clsx';
import * as React from 'react';
import { GRID_CHECKBOX_SELECTION_FIELD } from '../../colDef';
import { getDataGridUtilityClass, gridClasses } from '../../constants/gridClasses';
import { useThemedComponent } from '../../context/GridThemeContext';
import { gridColumnMenuSelector } from '../../hooks/features/columnMenu/columnMenuSelector';
import { useGridPrivateApiContext } from '../../hooks/utils/useGridPrivateApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { useGridSelector } from '../../hooks/utils/useGridSelector';
import { useRtl } from '../../hooks/utils/useRtl';
import { PinnedColumnPosition } from '../../internals/constants';
import { attachPinnedStyle } from '../../internals/utils';
import { GridStateColDef } from '../../models/colDef/gridColDef';
import { GridColumnHeaderEventLookup } from '../../models/events';
import { GridSortDirection } from '../../models/gridSortModel';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';
import { isEventTargetInPortal } from '../../utils/domUtils';
import { gridPinnedColumnPositionLookup } from '../cell/GridCell';
import { ColumnHeaderMenuIcon } from './ColumnHeaderMenuIcon';
import { GridColumnHeaderSeparatorProps } from './GridColumnHeaderSeparator';
import { GridGenericColumnHeaderItem } from './GridGenericColumnHeaderItem';

interface GridColumnHeaderItemProps {
  colIndex: number;
  colDef: GridStateColDef;
  columnMenuOpen: boolean;
  headerHeight: number;
  isDragging: boolean;
  isResizing: boolean;
  isLast: boolean;
  sortDirection: GridSortDirection;
  sortIndex?: number;
  filterItemsCounter?: number;
  hasFocus?: boolean;
  tabIndex: 0 | -1;
  disableReorder?: boolean;
  separatorSide?: GridColumnHeaderSeparatorProps['side'];
  pinnedPosition?: PinnedColumnPosition;
  pinnedOffset?: number;
  style?: React.CSSProperties;
  isLastUnpinned: boolean;
  isSiblingFocused: boolean;
  isLastPinnedLeft: boolean;
  isFirstPinnedRight: boolean;
  showLeftBorder: boolean;
  showRightBorder: boolean;
}

type OwnerState = GridColumnHeaderItemProps & {
  showRightBorder: boolean;
  showLeftBorder: boolean;
  classes?: DataGridProcessedProps['classes'];
};

const useUtilityClasses = (ownerState: OwnerState) => {
  const {
    colDef,
    classes,
    isDragging,
    sortDirection,
    showRightBorder,
    showLeftBorder,
    filterItemsCounter,
    pinnedPosition,
    isLastUnpinned,
    isSiblingFocused,
    isLastPinnedLeft,
    isFirstPinnedRight,
  } = ownerState;

  const isColumnSorted = sortDirection != null;
  const isColumnFiltered = filterItemsCounter != null && filterItemsCounter > 0;
  // todo refactor to a prop on col isNumeric or ?? ie: coltype===price wont work
  const isColumnNumeric = colDef.type === 'number';

  const slots = {
    root: [
      'columnHeader',
      colDef.headerAlign === 'left' && 'columnHeader--alignLeft',
      colDef.headerAlign === 'center' && 'columnHeader--alignCenter',
      colDef.headerAlign === 'right' && 'columnHeader--alignRight',
      colDef.sortable && 'columnHeader--sortable',
      isDragging && 'columnHeader--moving',
      isColumnSorted && 'columnHeader--sorted',
      isColumnFiltered && 'columnHeader--filtered',
      isColumnNumeric && 'columnHeader--numeric',
      'withBorderColor',
      showRightBorder && 'columnHeader--withRightBorder',
      showLeftBorder && 'columnHeader--withLeftBorder',
      pinnedPosition === PinnedColumnPosition.LEFT && 'columnHeader--pinnedLeft',
      pinnedPosition === PinnedColumnPosition.RIGHT && 'columnHeader--pinnedRight',
      // TODO: Remove classes below and restore `:has` selectors when they are supported in jsdom
      // See https://github.com/mui/mui-x/pull/14559
      isLastUnpinned && 'columnHeader--lastUnpinned',
      isSiblingFocused && 'columnHeader--siblingFocused',
    ],
    draggableContainer: ['columnHeaderDraggableContainer'],
    titleContainer: ['columnHeaderTitleContainer'],
    titleContainerContent: ['columnHeaderTitleContainerContent'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

function GridColumnHeaderItem(props: GridColumnHeaderItemProps) {
  const {
    colDef,
    columnMenuOpen: columnMenuOpenProp,
    colIndex,
    headerHeight,
    isResizing,
    isLast,
    sortDirection,
    sortIndex,
    filterItemsCounter,
    hasFocus,
    tabIndex,
    disableReorder,
    separatorSide,
    showLeftBorder,
    showRightBorder,
    pinnedPosition,
    pinnedOffset,
    isSiblingFocused,
  } = props;
  const apiRef = useGridPrivateApiContext();
  const rootProps = useGridRootProps();
  const isRtl = useRtl();
  const headerCellRef = React.useRef<HTMLDivElement>(null);
  const columnMenuId = useId();
  const columnMenuButtonId = useId();

  const columnMenuOpen = useGridSelector(apiRef, () => {
    const state = gridColumnMenuSelector(apiRef.current.state);
    return state.open && state.field === colDef.field;
  });

  const isDraggable = React.useMemo(
    () => !rootProps.disableColumnReorder && !disableReorder && !colDef.disableReorder,
    [rootProps.disableColumnReorder, disableReorder, colDef.disableReorder],
  );

  let headerComponent: React.ReactNode;
  if (colDef.renderHeader) {
    headerComponent = colDef.renderHeader(apiRef.current.getColumnHeaderParams(colDef.field));
  }

  const classes = useThemedComponent('columnHeader', {
    showLeftBorder,
    showRightBorder,
    checkbox: colDef.field === GRID_CHECKBOX_SELECTION_FIELD,
    pinned: pinnedPosition !== undefined,
  });

  const publish = React.useCallback(
    (eventName: keyof GridColumnHeaderEventLookup) => (event: React.SyntheticEvent) => {
      // Ignore portal
      // See https://github.com/mui/mui-x/issues/1721
      if (isEventTargetInPortal(event)) {
        return;
      }
      apiRef.current.publishEvent(
        eventName,
        apiRef.current.getColumnHeaderParams(colDef.field),
        event as any,
      );
    },
    [apiRef, colDef.field],
  );

  const handleContextMenu = React.useCallback(
    (event: React.MouseEvent) => {
      if (!event.ctrlKey) {
        event.stopPropagation();
        event.preventDefault();
        apiRef.current.toggleColumnMenu(colDef.field);
      }
      publish('columnHeaderContextMenu')(event);
    },
    [apiRef, publish],
  );

  const mouseEventsHandlers = React.useMemo(
    () => ({
      onClick: publish('columnHeaderClick'),
      onContextMenu: handleContextMenu,
      onDoubleClick: publish('columnHeaderDoubleClick'),
      onKeyDown: publish('columnHeaderKeyDown'),
      onFocus: publish('columnHeaderFocus'),
      onBlur: publish('columnHeaderBlur'),
      onPointerDown: publish('columnHeaderPointerDown'),
    }),
    [publish],
  );

  const columnHeaderSeparatorProps = React.useMemo(
    () => ({
      onMouseDown: publish('columnSeparatorMouseDown'),
      onDoubleClick: publish('columnSeparatorDoubleClick'),
    }),
    [publish],
  );

  /* const columnMenu = (
    <GridColumnHeaderMenu
      columnMenuId={columnMenuId!}
      columnMenuButtonId={columnMenuButtonId!}
      field={colDef.field}
      open={columnMenuOpen}
      target={iconButtonRef.current}
      ContentComponent={rootProps.slots.columnMenu}
      contentComponentProps={rootProps.slotProps?.columnMenu}
      onExited={handleExited}
    />
  ); */

  const columnMenuIconButton = !rootProps.disableColumnMenu && !colDef.disableColumnMenu && (
    <rootProps.slots.columnMenu
      colDef={colDef}
      hideMenu={apiRef.current.hideColumnMenu}
      showMenu={() => apiRef.current.showColumnMenu(colDef.field)}
      open={columnMenuOpen}
    >
      <ColumnHeaderMenuIcon
        colDef={colDef}
        columnMenuId={columnMenuId!}
        columnMenuButtonId={columnMenuButtonId!}
        open={columnMenuOpen}
      />
    </rootProps.slots.columnMenu>
  );

  const sortingOrder: readonly GridSortDirection[] = colDef.sortingOrder ?? rootProps.sortingOrder;
  const showSortIcon =
    (colDef.sortable || sortDirection != null) &&
    !colDef.hideSortIcons &&
    !rootProps.disableColumnSorting;

  const columnTitleIconButtons = (
    <React.Fragment>
      {showSortIcon && (
        <rootProps.slots.columnHeaderSortIcon
          field={colDef.field}
          direction={sortDirection}
          index={sortIndex}
          sortingOrder={sortingOrder}
          disabled={!colDef.sortable}
          {...rootProps.slotProps?.columnHeaderSortIcon}
        />
      )}
      {!rootProps.disableColumnFilter && (
        <rootProps.slots.columnHeaderFilterIconButton
          field={colDef.field}
          counter={filterItemsCounter}
          {...rootProps.slotProps?.columnHeaderFilterIconButton}
        />
      )}
    </React.Fragment>
  );

  useEnhancedEffect(() => {
    const columnMenuState = apiRef.current.state.columnMenu;
    if (hasFocus && !columnMenuState.open) {
      const focusableElement = headerCellRef.current!.querySelector<HTMLElement>('[tabindex="0"]');
      const elementToFocus = focusableElement || headerCellRef.current;
      elementToFocus?.focus();
      if (apiRef.current.columnHeadersContainerRef?.current) {
        apiRef.current.columnHeadersContainerRef.current.scrollLeft = 0;
      }
    }
  }, [apiRef, hasFocus]);

  const headerClassName =
    typeof colDef.headerClassName === 'function'
      ? colDef.headerClassName({ field: colDef.field, colDef })
      : colDef.headerClassName;

  const label = colDef.headerName ?? colDef.field;

  const style = React.useMemo(
    () => attachPinnedStyle({ ...props.style }, isRtl, pinnedPosition, pinnedOffset),
    [pinnedPosition, pinnedOffset, props.style, isRtl],
  );

  return (
    <GridGenericColumnHeaderItem
      ref={headerCellRef}
      classes={{
        root: classes.root,
        draggableContainer: classes.variants.draggableContainer,
        titleContainer: classes.variants.titleContainer,
        titleContainerContent: classes.variants.titleContainerContent,
        title: classes.variants.title,
      }}
      columnMenuOpen={columnMenuOpen}
      colIndex={colIndex}
      height={headerHeight}
      isResizing={isResizing}
      sortDirection={sortDirection}
      hasFocus={hasFocus}
      tabIndex={tabIndex}
      separatorSide={separatorSide}
      headerComponent={headerComponent}
      description={colDef.description}
      elementId={colDef.field}
      width={colDef.computedWidth}
      columnMenuIconButton={columnMenuIconButton}
      columnTitleIconButtons={columnTitleIconButtons}
      headerClassName={clsx(headerClassName, isLast && gridClasses['columnHeader--last'])}
      label={label}
      resizable={!rootProps.disableColumnResize && !!colDef.resizable}
      data-field={colDef.field}
      data-align={colDef.headerAlign}
      data-first={colIndex === 0 || undefined}
      data-last={isLast || undefined}
      data-resizable={colDef.resizable || undefined}
      data-draggable={isDraggable || undefined}
      data-dragging={props.isDragging || undefined}
      data-sorted={Boolean(props.sortDirection) || undefined}
      data-sibling-focused={isSiblingFocused || undefined}
      data-pinned={(pinnedPosition && gridPinnedColumnPositionLookup[pinnedPosition]) || undefined}
      data-last-unpinned={props.isLastUnpinned || undefined}
      data-last-pinned-left={props.isLastPinnedLeft || undefined}
      data-first-pinned-right={props.isFirstPinnedRight || undefined}
      columnHeaderSeparatorProps={columnHeaderSeparatorProps}
      style={style}
      {...mouseEventsHandlers}
    />
  );
}

const Memoized = fastMemo(GridColumnHeaderItem);

export { Memoized as GridColumnHeaderItem };
