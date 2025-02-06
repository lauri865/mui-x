import * as React from 'react';
import { unstable_useEventCallback as useEventCallback } from '@mui/utils';
import { GridColumnHeaderParams } from '../../models/params/gridColumnHeaderParams';
import { useGridApiEventHandler } from '../../hooks/utils/useGridApiEventHandler';
import { useGridPrivateApiContext } from '../../hooks/utils/useGridPrivateApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { findGridCellElementsFromCol } from '../../utils/domUtils';

export function GridDragDrop() {
  const originalIndex = React.useRef<number>(0);
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
      apiRef.current.setColumnIndex(draggedColumn.field, originalIndex.current);
      apiRef.current.setColumnVisibility(draggedColumn.field, true);
      pointerUp();
    }
  }, []);

  const pointerGridLeave = React.useCallback(() => {
    const draggedColumn = draggedColumnRef.current;
    if (!draggedColumn) {
      return;
    }
    apiRef.current.setColumnVisibility(draggedColumn.field, false);
    setAction('hide');
  }, []);

  const pointerGridEnter = React.useCallback((event: PointerEvent) => {
    const draggedColumn = draggedColumnRef.current;
    if (!draggedColumn) {
      return;
    }

    if (action === 'hide') {
      apiRef.current.setColumnVisibility(draggedColumn.field, true);
      setAction('move');
    }
  }, []);

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
        gridRef.addEventListener('pointerenter', pointerGridEnter);
      }
      const el = apiRef.current.getColumnHeaderElement(draggedColumnRef.current.field);
      if (el) {
        el.addEventListener('click', preventClick, { once: true });
      }
    }
    setPointerPosition({ x: event.clientX, y: event.clientY });
    updateRefs();
    const col = draggedColumnRef.current;
    if (col) {
      const cell = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;
      if (!cell) {
        return;
      }
      if (cell.role === 'gridcell' || cell.role === 'columnheader') {
        const field = cell.getAttribute('data-field');
        if (!field || field === col.field) {
          return;
        }
        const width = col.colDef.computedWidth;
        const overColumn = apiRef.current.getColumn(field);
        if (overColumn.disableReorder) {
          return;
        }
        const overWidth = overColumn.computedWidth;
        const newIndex = apiRef.current.getColumnIndex(field);
        const currentIndex = apiRef.current.getColumnIndex(col.field);
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

        apiRef.current.setColumnIndex(col.field, newIndex);
        apiRef.current.setColumnIndex(
          overColumn.field,
          newIndex + (direction === 'right' ? -1 : 1),
        );
      } else if (cell.dataset.field === '«filler-right»') {
        const newIndex = apiRef.current.getAllColumns().length - 1;
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
      gridRef.removeEventListener('pointerenter', pointerGridEnter);
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
      className="fixed flex gap-2 items-center top-0 left-0 z-9999 pointer-events-none px-cell bg-highlight border border-highlight-border backdrop-blur-sm min-w-[100px] font-medium rounded-grid *:size-3.5"
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
