import {
  unstable_capitalize as capitalize,
  unstable_composeClasses as composeClasses,
  unstable_ownerDocument as ownerDocument,
  unstable_useForkRef as useForkRef,
} from '@mui/utils';
import useEnhancedEffect from '@mui/utils/useEnhancedEffect';
import { fastMemo } from '@mui/x-internals/fastMemo';
import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import * as React from 'react';
import { getDataGridUtilityClass, gridClasses } from '../../constants/gridClasses';
import { useThemedComponent } from '../../context/GridThemeContext';
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
import { useGridSelector } from '../../hooks/utils/useGridSelector';
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
import type { DataGridProcessedProps } from '../../models/props/DataGridProps';
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

type OwnerState = Pick<GridCellProps, 'align' | 'pinnedPosition'> & {
  showLeftBorder: boolean;
  showRightBorder: boolean;
  isEditable: boolean;
  isSelected: boolean;
  isSelectionMode: boolean;
  classes: DataGridProcessedProps['classes'];
};

const useUtilityClasses = (ownerState: OwnerState) => {
  const {
    align,
    showLeftBorder,
    showRightBorder,
    pinnedPosition,
    isEditable,
    isSelected,
    isSelectionMode,
    classes,
  } = ownerState;

  const slots = {
    root: [
      'cell',
      `cell--text${capitalize(align)}`,
      isSelected && 'selected',
      isEditable && 'cell--editable',
      showLeftBorder && 'cell--withLeftBorder',
      showRightBorder && 'cell--withRightBorder',
      // needed for resizer
      pinnedPosition === PinnedColumnPosition.LEFT && 'cell--pinnedLeft',
      pinnedPosition === PinnedColumnPosition.RIGHT && 'cell--pinnedRight',
      isSelectionMode && !isEditable && 'cell--selectionMode',
    ],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

let warnedOnce = false;

// TODO(v7): Removing the wrapper will break the docs performance visualization demo.

const GridCell = forwardRef<HTMLDivElement, GridCellProps>(function GridCell(props, ref) {
  const {
    column,
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

  const field = column.field;

  const editCellState: GridEditCellProps<any> | null = useGridSelector(
    apiRef,
    gridEditCellStateSelector,
    {
      rowId,
      field,
    },
    undefined,
    props.column.editable,
  );

  const cellMode: GridCellModes = editCellState ? GridCellModes.Edit : GridCellModes.View;

  const cellParams: GridCellParams<any, any, any, any> = apiRef.current.getCellParamsForRow<
    any,
    any,
    any,
    GridTreeNodeWithRender
  >(rowId, field, row, {
    colDef: column,
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

  cellParams.api = apiRef.current;

  const isSelected = useGridSelector(
    apiRef,
    () =>
      apiRef.current.unstable_applyPipeProcessors('isCellSelected', false, {
        id: rowId,
        field,
      }),
    undefined,
    undefined,
    rootProps.cellSelection,
  );

  const hiddenCells = useGridSelector(
    apiRef,
    gridRowSpanningHiddenCellsSelector,
    undefined,
    undefined,
    rootProps.rowSpanning,
  );
  const spannedCells = useGridSelector(
    apiRef,
    gridRowSpanningSpannedCellsSelector,
    undefined,
    undefined,
    rootProps.rowSpanning,
  );

  const { hasFocus, isEditable = false, value } = cellParams;

  const canManageOwnFocus =
    column.type === 'actions' &&
    (column as GridActionsColDef)
      .getActions?.(apiRef.current.getRowParams(rowId))
      .some((action) => !action.props.disabled);
  const tabIndex =
    (cellMode === 'view' || !isEditable) && !canManageOwnFocus ? cellParams.tabIndex : -1;

  const { classes: rootClasses, getCellClassName } = rootProps;

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
    if (!hasFocus || cellMode === GridCellModes.Edit) {
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
            `MUI X: The cell with id=${rowId} and field=${field} received focus.`,
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
    children = column.renderCell(cellParams);
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
    classNames.push(rootClasses?.['cell--editing']);
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
  const showEmpty = children === null || children === undefined || children === '';
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

const showOverflow = (showRightBorder: boolean) => (event: Event) => {
  const el = event.currentTarget as HTMLElement;
  const isOverflowingX = el.scrollWidth > el.clientWidth;
  const isOverflowingY = el.scrollHeight > el.clientHeight;
  if (isOverflowingX) {
    const delta = el.scrollWidth - el.clientWidth;
    el.style.minWidth = `${el.clientWidth + delta}px`;
    el.style.overflow = 'visible';
    el.style.marginRight = `-${delta + (showRightBorder ? -1 : 0)}px`;
    el.style.zIndex = '1';
    el.style.borderRight = '1px solid var(--color-grid-border)';
  }
  if (isOverflowingY) {
    const delta = el.scrollHeight - el.clientHeight;
    el.style.overflow = 'visible';
    el.style.marginBottom = `-${delta}px`;
    el.style.zIndex = '1';
    el.style.borderRight = '1px solid var(--color-grid-border)';
    el.style.borderBottom = '1px solid var(--color-grid-border)';
  }
};

const hideOverflow = (event: Event) => {
  const el = event.currentTarget as HTMLElement;
  el.style.minWidth = '';
  el.style.overflow = '';
  el.style.marginRight = '';
  el.style.marginBottom = '';
  el.style.zIndex = '';
  el.style.borderRight = '';
  el.style.borderBottom = '';
};

const MemoizedGridCell = fastMemo(GridCell);

export { MemoizedGridCell as GridCell };
