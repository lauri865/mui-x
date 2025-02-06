import * as React from 'react';
import { unstable_useEventCallback as useEventCallback } from '@mui/utils';
import { GridColumnHeaderParams } from '../../models/params/gridColumnHeaderParams';
import { useGridApiEventHandler } from '../../hooks/utils/useGridApiEventHandler';
import { useGridPrivateApiContext } from '../../hooks/utils/useGridPrivateApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { findGridCellElementsFromCol } from '../../utils/domUtils';
import { GridPinnedColumnPosition } from '../../hooks/features/columns/gridColumnsInterfaces';
import {
  gridColumnVisibilityModelSelector,
  gridVisiblePinnedColumnsSelector,
} from '../../hooks/features/columns/gridColumnsSelector';

export function GridDragDrop() {
  const originalIndex = React.useRef<number>(0);
  const originalPinnedPosition = React.useRef<GridPinnedColumnPosition | null>(null);
  const startPosition = React.useRef<{
    x: number;
    y: number;
  }>(null);
  const rootProps = useGridRootProps();
  const draggedColumnRef = React.useRef<GridColumnHeaderParams | null>(null);
  const cellsRef = React.useRef<HTMLElement[] | null>(null);
  const apiRef = useGridPrivateApiContext();
  const [action, setAction] = React.useState<'move' | 'hide'>('move');
  const [draggedColumn, setDraggedColumn] = React.useState<GridColumnHeaderParams | null>(null);
  const isReordering = React.useRef(false);
  const [pointer, setPointerPosition] = React.useState({ x: 0, y: 0 });

  const getDraggedColumn = useEventCallback(() => draggedColumn);

  const onKeyDown = React.useCallback((event: KeyboardEvent) => {
    const draggedColumn = draggedColumnRef.current;
    if (!draggedColumn) {
      return;
    }
    if (event.key === 'Escape') {
      if (originalPinnedPosition.current) {
        apiRef.current.pinColumn(draggedColumn.field, originalPinnedPosition.current);
      } else {
        // this has to come before setColumnIndex, otherwise we'll restore to the wrong index
        apiRef.current.unpinColumn(draggedColumn.field);
      }
      apiRef.current.setColumnIndex(draggedColumn.field, originalIndex.current);
      apiRef.current.setColumnVisibility(draggedColumn.field, true);
      pointerUp();
    }
  }, []);

  const pointerGridLeave = useEventCallback(() => {
    const draggedColumn = draggedColumnRef.current;
    if (!draggedColumn) {
      return;
    }
    apiRef.current.setColumnVisibility(draggedColumn.field, false);
    apiRef.current.unpinColumn(draggedColumn.field);
    setAction('hide');
  });

  const preventClick = React.useCallback((event: MouseEvent) => {
    event.preventDefault();
  }, []);

  const updateRefs = () => {
    if (!draggedColumnRef.current) {
      return;
    }

    const el = apiRef.current.getColumnHeaderElement(draggedColumnRef.current.field);
    if (el) {
      cellsRef.current = findGridCellElementsFromCol(el, apiRef.current) as HTMLElement[];
      cellsRef.current?.forEach((cell) => {
        cell.dataset.reordering = 'true';
      });
    }
  };

  const pointerMove = useEventCallback((event: PointerEvent) => {
    if (!startPosition.current || !draggedColumnRef.current) {
      return;
    }
    const deltaX = event.clientX - startPosition.current.x;
    const deltaY = event.clientY - startPosition.current.y;
    if (!isReordering.current) {
      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
        return;
      }
      isReordering.current = true;
      setDraggedColumn(draggedColumnRef.current);
      document.documentElement.classList.add('dragging');
      document.body.addEventListener('keydown', onKeyDown);
      apiRef.current.publishEvent('columnHeaderDragStart', draggedColumnRef.current, event as any);
      const gridRef = apiRef.current.rootElementRef.current;
      if (gridRef) {
        gridRef.dataset.dragging = 'true';
        gridRef.addEventListener('pointerleave', pointerGridLeave);
      }
      const el = apiRef.current.getColumnHeaderElement(draggedColumnRef.current.field);
      if (el) {
        el.addEventListener('click', preventClick, { once: true });
      }
    }
    setPointerPosition({ x: event.clientX, y: event.clientY });

    requestAnimationFrame(() => {
      updateRefs();
    });
    const col = draggedColumnRef.current;
    if (col) {
      const cell = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;
      if (!cell) {
        return;
      }
      if (cell.role === 'gridcell' || cell.role === 'columnheader') {
        const visibilityModel = gridColumnVisibilityModelSelector(apiRef.current.state);
        const isHidden = visibilityModel[col.field] === false;
        if (isHidden) {
          apiRef.current.setColumnVisibility(col.field, true);
          setAction('move');
        }
        const field = cell.getAttribute('data-field');
        if (!field || field === col.field) {
          return;
        }
        const width = col.colDef.computedWidth;
        const overColumn = apiRef.current.getColumn(field);
        const overWidth = overColumn.computedWidth;
        const newIndex = apiRef.current.getColumnIndex(field, false);
        const currentIndex = apiRef.current.getColumnIndex(col.field, false);
        const direction = currentIndex < newIndex ? 'right' : 'left';

        if (overWidth > width) {
          const needsToMoveAtleast = overWidth - width;
          if (direction === 'right') {
            const leftEdge = cell.getBoundingClientRect().left;
            if (event.clientX < leftEdge + needsToMoveAtleast) {
              return;
            }
          } else {
            const rightEdge = cell.getBoundingClientRect().right;
            if (event.clientX > rightEdge - needsToMoveAtleast) {
              return;
            }
          }
        }

        const nextPinnedPosition = apiRef.current.getColumnPinnedPosition(overColumn.field);
        const currentPinnedPosition = apiRef.current.getColumnPinnedPosition(col.field);
        if (nextPinnedPosition !== currentPinnedPosition) {
          if (nextPinnedPosition) {
            apiRef.current.pinColumn(col.field, nextPinnedPosition);
          } else {
            apiRef.current.unpinColumn(col.field);
          }
        }

        if (overColumn.disableReorder) {
          return;
        }

        apiRef.current.setColumnIndex(col.field, newIndex);
      } else if (cell.dataset.field === '«filler-right-body»') {
        const visibilityModel = gridColumnVisibilityModelSelector(apiRef.current.state);
        const isHidden = visibilityModel[col.field] === false;
        if (isHidden) {
          apiRef.current.setColumnVisibility(col.field, true);
          setAction('move');
        }
        apiRef.current.unpinColumn(col.field);
        const pinnedColumns = gridVisiblePinnedColumnsSelector(apiRef.current.state);
        const newIndex = apiRef.current.getAllColumns().length - 1 - pinnedColumns.right.length;
        apiRef.current.setColumnIndex(col.field, newIndex);
      }
    }
  });

  const pointerUp = useEventCallback((event?: PointerEvent) => {
    event?.preventDefault();
    const draggedColumn = getDraggedColumn();
    if (draggedColumn) {
      apiRef.current.publishEvent('columnHeaderDragEnd', draggedColumn, {} as any);
      const el = apiRef.current.getColumnHeaderElement(draggedColumn.field);
      if (el) {
        requestAnimationFrame(() => {
          el.removeEventListener('click', preventClick);
        });
      }
    }
    isReordering.current = false;
    startPosition.current = null;
    cellsRef.current?.forEach((cell) => {
      cell?.removeAttribute('data-reordering');
    });
    cellsRef.current = null;
    setDraggedColumn(null);
    document.body.removeEventListener('pointermove', pointerMove);
    document.body.removeEventListener('keydown', onKeyDown);
    document.body.removeEventListener('pointerup', pointerUp);
    document.documentElement.classList.remove('dragging');
    const gridRef = apiRef.current.rootElementRef.current;
    if (gridRef) {
      gridRef.removeAttribute('data-dragging');
      gridRef.removeEventListener('pointerleave', pointerGridLeave);
    }
    document.documentElement.classList.remove('dragging');
  });

  useGridApiEventHandler(apiRef, 'columnHeaderPointerDown', (params, event) => {
    if (event.button !== 0 || params.colDef.disableReorder) {
      return;
    }
    startPosition.current = { x: event.clientX, y: event.clientY };
    originalIndex.current = apiRef.current.getColumnIndex(params.field);
    draggedColumnRef.current = params;
    originalPinnedPosition.current = apiRef.current.getColumnPinnedPosition(params.field);
    document.body.addEventListener('pointermove', pointerMove);
    document.body.addEventListener('pointerup', pointerUp, { once: true });
  });

  React.useEffect(() => {
    return () => {
      pointerUp();
    };
  }, []);

  if (!draggedColumn) {
    return null;
  }

  return (
    <div
      className="fixed flex gap-2 items-center top-0 left-0 z-9999 pointer-events-none px-cell bg-highlight border border-highlight-border backdrop-blur-sm min-w-[100px] font-medium rounded-grid *:size-3.5 will-change-transform"
      style={{
        transform: `translate3d(${pointer.x + 5}px, ${pointer.y + 5}px, 0)`,
        height: 36,
        lineHeight: 36,
      }}
    >
      {action === 'hide' ? (
        <rootProps.slots.hideIcon className="opacity-50" />
      ) : (
        <rootProps.slots.reorderIcon className="opacity-50" />
      )}
      {draggedColumn.colDef.headerName || draggedColumn.field}
    </div>
  );
}
