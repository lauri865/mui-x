import {
  unstable_ownerDocument as ownerDocument,
  unstable_useForkRef as useForkRef,
} from '@mui/utils';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { fastMemo } from '@mui/x-internals/fastMemo';
import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import * as React from 'react';
import { GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD } from '../../colDef';
import { gridClasses } from '../../constants/gridClasses';
import { useThemedComponent } from '../../context/GridThemeContext';
import { gridPreferencePanelStateSelector } from '../../hooks';
import { GridPinnedColumnPosition } from '../../hooks/features/columns/gridColumnsInterfaces';
import { gridEditCellStateSelector } from '../../hooks/features/editing/gridEditingSelectors';
import {
  gridFocusCellSelector,
  gridTabIndexCellSelector,
} from '../../hooks/features/focus/gridFocusStateSelector';
import {
  gridRowSpanningHiddenCellsSelector,
  gridRowSpanningSpannedCellsSelector,
} from '../../hooks/features/rows/gridRowSpanningSelectors';
import { useGridPrivateApiContext } from '../../hooks/utils/useGridPrivateApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { useGridConditionalSelector, useGridSelector } from '../../hooks/utils/useGridSelector';
import { useRtl } from '../../hooks/utils/useRtl';
import { PinnedColumnPosition } from '../../internals/constants';
import { attachPinnedStyle } from '../../internals/utils';
import {
  GridActionsColDef,
  GridCellEventLookup,
  GridCellModes,
  GridEditCellProps,
  GridEvents,
  GridRowId,
} from '../../models';
import { GridAlignment, GridStateColDef } from '../../models/colDef/gridColDef';
import { GridRowModel, GridTreeNode, GridTreeNodeWithRender } from '../../models/gridRows';
import {
  FocusElement,
  GridCellParams,
  GridRenderEditCellParams,
} from '../../models/params/gridCellParams';
import { doesSupportPreventScroll } from '../../utils/doesSupportPreventScroll';

export const gridPinnedColumnPositionLookup = {
  [PinnedColumnPosition.LEFT]: GridPinnedColumnPosition.LEFT,
  [PinnedColumnPosition.RIGHT]: GridPinnedColumnPosition.RIGHT,
  [PinnedColumnPosition.NONE]: undefined,
  [PinnedColumnPosition.VIRTUAL]: undefined,
};

export type GridCellProps = React.HTMLAttributes<HTMLDivElement> & {
  align: GridAlignment;
  className?: string;
  colIndex: number;
  column: GridStateColDef;
  row: GridRowModel;
  rowId: GridRowId;
  rowNode: GridTreeNode;
  width: number;
  colSpan?: number;
  disableDragEvents?: boolean;
  isNotVisible: boolean;
  pinnedOffset?: number;
  pinnedPosition: PinnedColumnPosition;
  showRightBorder: boolean;
  showLeftBorder: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  onMouseUp?: React.MouseEventHandler<HTMLDivElement>;
  onMouseOver?: React.MouseEventHandler<HTMLDivElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLDivElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  onDragEnter?: React.DragEventHandler<HTMLDivElement>;
  onDragOver?: React.DragEventHandler<HTMLDivElement>;
  onFocus?: React.FocusEventHandler<Element>;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  [x: `data-${string}`]: string;
};

let warnedOnce = false;

// TODO(v7): Removing the wrapper will break the docs performance visualization demo.

const GridCell = forwardRef<HTMLDivElement, GridCellProps>(function GridCell(props, ref) {
  const {
    column: columnProp,
    row,
    rowId,
    rowNode,
    align,
    children: childrenProp,
    colIndex,
    width,
    className,
    style: styleProp,
    colSpan,
    disableDragEvents,
    isNotVisible,
    pinnedOffset,
    pinnedPosition,
    showRightBorder,
    showLeftBorder,
    onClick,
    onDoubleClick,
    onMouseDown,
    onMouseUp,
    onMouseOver,
    onKeyDown,
    onKeyUp,
    onDragEnter,
    onDragOver,
    ...other
  } = props;

  const apiRef = useGridPrivateApiContext();
  const rootProps = useGridRootProps();
  const isRtl = useRtl();

  const field = columnProp.field;

  const editCellState: GridEditCellProps<any> | null = useGridConditionalSelector(
    apiRef,
    props.column.editable,
    gridEditCellStateSelector,
    {
      rowId,
      field,
    },
  );

  const cellMode: GridCellModes = editCellState ? GridCellModes.Edit : GridCellModes.View;

  const cellParams: GridCellParams<any, any, any, any> = apiRef.current.getCellParamsForRow<
    any,
    any,
    any,
    GridTreeNodeWithRender
  >(rowId, field, row, {
    colDef: columnProp,
    cellMode,
    rowNode: rowNode as GridTreeNodeWithRender,
    tabIndex: useGridSelector(apiRef, () => {
      const cellTabIndex = gridTabIndexCellSelector(apiRef);
      return cellTabIndex && cellTabIndex.field === field && cellTabIndex.id === rowId ? 0 : -1;
    }),
    hasFocus: useGridSelector(apiRef, () => {
      const focus = gridFocusCellSelector(apiRef);
      return focus?.id === rowId && focus.field === field;
    }),
  });

  const column = cellParams.colDef;

  cellParams.api = apiRef.current;

  const isSelected = useGridConditionalSelector(apiRef, rootProps.cellSelection, () =>
    apiRef.current.unstable_applyPipeProcessors('isCellSelected', false, {
      id: rowId,
      field,
    }),
  );

  const hiddenCells = useGridConditionalSelector(
    apiRef,
    rootProps.rowSpanning,
    gridRowSpanningHiddenCellsSelector,
  );
  const spannedCells = useGridConditionalSelector(
    apiRef,
    rootProps.rowSpanning,
    gridRowSpanningSpannedCellsSelector,
  );

  const { hasFocus, isEditable = false, value } = cellParams;

  const canManageOwnFocus =
    column.type === 'actions' &&
    (column as GridActionsColDef)
      .getActions?.(apiRef.current.getRowParams(rowId), {
        api: apiRef.current,
        Button: rootProps.slots.baseButton,
        IconButton: rootProps.slots.baseIconButton,
        MenuItem: rootProps.slots.baseDropdownMenu.Item,
        MenuSeparator: rootProps.slots.baseDropdownMenu.Separator,
      })
      .some((action) => !action.props.disabled);
  const tabIndex =
    (cellMode === 'view' || !isEditable) && !canManageOwnFocus ? cellParams.tabIndex : -1;

  const { getCellClassName } = rootProps;

  // There is a hidden grid state access in `applyPipeProcessor('cellClassName', ...)`
  const pipesClassName = apiRef.current
    .unstable_applyPipeProcessors('cellClassName', [], {
      id: rowId,
      field,
    })
    .filter(Boolean)
    .join(' ');

  const classNames = [pipesClassName] as (string | undefined)[];

  if (column.cellClassName) {
    classNames.push(
      typeof column.cellClassName === 'function'
        ? column.cellClassName(cellParams)
        : column.cellClassName,
    );
  }

  if (getCellClassName) {
    classNames.push(getCellClassName(cellParams));
  }

  const valueToRender = cellParams.formattedValue ?? value;
  const cellRef = React.useRef<HTMLDivElement>(null);
  const handleRef = useForkRef(ref, cellRef);
  const focusElementRef = React.useRef<FocusElement>(null);

  const isEditing = editCellState !== null && !!column.renderEditCell;

  const classes = useThemedComponent('cell', {
    editable: isEditable,
    pinned:
      pinnedPosition === PinnedColumnPosition.LEFT || pinnedPosition === PinnedColumnPosition.RIGHT,
    showRightBorder,
    showLeftBorder,
    left: align === 'left',
    center: align === 'center',
    right: align === 'right',
    flex: column.display === 'flex',
    group: rowNode.type === 'group' && field === GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD,
    editing: isEditing,
  });

  const publishMouseUp = React.useCallback(
    (eventName: GridEvents) => (event: React.MouseEvent<HTMLDivElement>) => {
      const params = apiRef.current.getCellParams(rowId, field || '');
      apiRef.current.publishEvent(eventName as any, params as any, event);

      if (onMouseUp) {
        onMouseUp(event);
      }
    },
    [apiRef, field, onMouseUp, rowId],
  );

  const publishMouseDown = React.useCallback(
    (eventName: GridEvents) => (event: React.MouseEvent<HTMLDivElement>) => {
      const params = apiRef.current.getCellParams(rowId, field || '');
      apiRef.current.publishEvent(eventName as any, params as any, event);

      if (onMouseDown) {
        onMouseDown(event);
      }
    },
    [apiRef, field, onMouseDown, rowId],
  );

  const publish = React.useCallback(
    (eventName: keyof GridCellEventLookup, propHandler?: any) =>
      (event: React.SyntheticEvent<HTMLDivElement>) => {
        // The row might have been deleted during the click
        if (!apiRef.current.getRow(rowId)) {
          return;
        }

        const params = apiRef.current.getCellParams(rowId!, field || '');
        apiRef.current.publishEvent(eventName, params, event as any);

        if (propHandler) {
          propHandler(event);
        }
      },
    [apiRef, field, rowId],
  );

  const isCellRowSpanned = hiddenCells[rowId]?.[field] ?? false;
  const rowSpan = spannedCells[rowId]?.[field] ?? 1;

  const style = React.useMemo(() => {
    if (isNotVisible) {
      return {
        padding: 0,
        opacity: 0,
        width: 0,
        height: 0,
        border: 0,
      };
    }

    const cellStyle = attachPinnedStyle(
      {
        '--width': `${width}px`,
        width: `var(--width)`,
        ...styleProp,
      } as React.CSSProperties,
      isRtl,
      pinnedPosition,
      pinnedOffset,
    );

    if (rowNode.type === 'group') {
      (cellStyle as React.CSSProperties & Record<string, any>)['--depth'] = rowNode.depth;
    }

    const isLeftPinned = pinnedPosition === PinnedColumnPosition.LEFT;
    const isRightPinned = pinnedPosition === PinnedColumnPosition.RIGHT;

    if (rowSpan > 1) {
      cellStyle.height = `calc(var(--height) * ${rowSpan})`;
      cellStyle.zIndex = 5;

      if (isLeftPinned || isRightPinned) {
        cellStyle.zIndex = 6;
      }
    }

    return cellStyle;
  }, [width, isNotVisible, styleProp, pinnedOffset, pinnedPosition, isRtl, rowSpan]);

  useEnhancedEffect(() => {
    const preferencePanelState = gridPreferencePanelStateSelector(apiRef.current.state);
    if (!hasFocus || cellMode === GridCellModes.Edit || preferencePanelState.open) {
      return;
    }

    const doc = ownerDocument(apiRef.current.rootElementRef!.current)!;

    if (cellRef.current && !cellRef.current.contains(doc.activeElement!)) {
      const focusableElement = cellRef.current!.querySelector<HTMLElement>('[tabindex="0"]');
      const elementToFocus = focusElementRef.current || focusableElement || cellRef.current;

      if (doesSupportPreventScroll()) {
        requestAnimationFrame(() => {
          elementToFocus.focus({ preventScroll: true });
        });
      } else {
        const scrollPosition = apiRef.current.getScrollPosition();
        elementToFocus.focus();
        apiRef.current.scroll(scrollPosition);
      }
    }
  }, [hasFocus, cellMode, apiRef]);

  if (isCellRowSpanned) {
    return (
      <div
        data-colindex={colIndex}
        role="presentation"
        style={{ width: 'var(--width)', ...style }}
      />
    );
  }

  let handleFocus: any = other.onFocus;

  if (
    process.env.NODE_ENV === 'test' &&
    rootProps.experimentalFeatures?.warnIfFocusStateIsNotSynced
  ) {
    handleFocus = (event: React.FocusEvent) => {
      const focusedCell = gridFocusCellSelector(apiRef);
      if (focusedCell?.id === rowId && focusedCell.field === field) {
        if (typeof other.onFocus === 'function') {
          other.onFocus(event);
        }
        return;
      }

      if (!warnedOnce) {
        console.warn(
          [
            `TWGrid: The cell with id=${rowId} and field=${field} received focus.`,
            `According to the state, the focus should be at id=${focusedCell?.id}, field=${focusedCell?.field}.`,
            "Not syncing the state may cause unwanted behaviors since the `cellFocusIn` event won't be fired.",
            'Call `fireEvent.mouseUp` before the `fireEvent.click` to sync the focus with the state.',
          ].join('\n'),
        );

        warnedOnce = true;
      }
    };
  }

  let children: React.ReactNode;

  if (editCellState === null && column.renderCell) {
    children = column.renderCell(cellParams, column.renderCellProps);
  }

  if (editCellState !== null && column.renderEditCell) {
    const updatedRow = apiRef.current.getRowWithUpdatedValues(rowId, column.field);

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { changeReason, unstable_updateValueOnRender, ...editCellStateRest } = editCellState;

    const formattedValue = column.valueFormatter
      ? column.valueFormatter(editCellState.value as never, updatedRow, column, apiRef)
      : cellParams.formattedValue;

    const params: GridRenderEditCellParams = {
      ...cellParams,
      row: updatedRow,
      formattedValue,
      ...editCellStateRest,
    };

    children = column.renderEditCell(params);
    classNames.push(gridClasses['cell--editing']);
  }

  if (children === undefined) {
    const valueString = valueToRender?.toString();
    children = valueString;
  }

  if (React.isValidElement(children) && canManageOwnFocus) {
    children = React.cloneElement<any>(children, { focusElementRef });
  }

  const showOverflowWithBorder = React.useCallback(showOverflow(showRightBorder), [
    showRightBorder,
  ]);
  const showEmpty =
    rowNode.type !== 'group' &&
    columnProp.type !== 'custom' &&
    (children === null || children === undefined || children === '');

  return (
    <div
      className={clsx(classes.root, classNames, className)}
      role="gridcell"
      data-field={field}
      data-align={align}
      data-colindex={colIndex}
      aria-colindex={colIndex + 1}
      aria-colspan={colSpan}
      aria-rowspan={rowSpan}
      data-selected={isSelected || undefined}
      data-pinned={gridPinnedColumnPositionLookup[pinnedPosition]}
      style={style}
      tabIndex={tabIndex}
      onClick={publish('cellClick', onClick)}
      onDoubleClick={publish('cellDoubleClick', onDoubleClick)}
      onMouseDown={publishMouseDown('cellPointerDown')}
      onMouseUp={publishMouseUp('cellMouseUp')}
      onKeyDown={publish('cellKeyDown', onKeyDown)}
      onKeyUp={publish('cellKeyUp', onKeyUp)}
      onContextMenu={publish('cellContextMenu')}
      onPointerEnter={showOverflowWithBorder as any}
      onPointerLeave={hideOverflow as any}
      onFocusCapture={showOverflowWithBorder as any}
      onBlur={hideOverflow as any}
      {...other}
      onFocus={handleFocus}
      ref={handleRef}
    >
      {showEmpty ? <span className={clsx(classes.variants.empty)}>–</span> : children}
    </div>
  );
});

function showOverflow(showRightBorder: boolean) {
  return (event: Event) => {
    const el = event.currentTarget as HTMLElement;
    const isOverflowingX = el.scrollWidth > el.clientWidth;
    const isOverflowingY = el.scrollHeight > el.clientHeight;
    if (isOverflowingX) {
      const delta = Math.min(100, el.scrollWidth - el.clientWidth + 10);
      el.style.minWidth = `${el.clientWidth + delta}px`;
      el.style.overflow = 'visible';
      el.style.marginRight = `-${delta + (showRightBorder ? -1 : 0)}px`;
      el.style.zIndex = '1';
      el.style.borderRight = '1px solid var(--color-grid-border)';
    }
    if (isOverflowingY) {
      const delta = Math.min(100, el.scrollHeight - el.clientHeight);
      el.style.overflow = 'visible';
      el.style.marginBottom = `-${delta}px`;
      el.style.zIndex = '1';
      el.style.borderRight = '1px solid var(--color-grid-border)';
      el.style.borderBottom = '1px solid var(--color-grid-border)';
    }
  };
}

function hideOverflow(event: Event) {
  const el = event.currentTarget as HTMLElement;
  el.style.minWidth = '';
  el.style.overflow = '';
  el.style.marginRight = '';
  el.style.marginBottom = '';
  el.style.zIndex = '';
  el.style.borderRight = '';
  el.style.borderBottom = '';
}

const MemoizedGridCell = fastMemo(GridCell);

export { MemoizedGridCell as GridCell };
