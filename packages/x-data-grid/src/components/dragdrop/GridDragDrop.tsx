import { GridColumnHeaderParams } from '../../models/params/gridColumnHeaderParams';
import { useGridApiEventHandler } from '../../hooks/utils/useGridApiEventHandler';
import React from 'react';
import { useGridPrivateApiContext } from '../../hooks/utils/useGridPrivateApiContext';
import { useEventCallback } from '@mui/material';

export const GridDragDrop = () => {
  const originalIndex = React.useRef<number>(0);
  const startPosition = React.useRef<{
    x: number;
    y: number;
  }>(null);
  const draggedColumnRef = React.useRef<GridColumnHeaderParams | null>(null);
  const apiRef = useGridPrivateApiContext();
  const [action, setAction] = React.useState<'move' | 'hide'>('move');
  const [draggedColumn, setDraggedColumn] = React.useState<GridColumnHeaderParams | null>(null);
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

  const pointerGridEnter = useEventCallback((event: PointerEvent) => {
    const draggedColumn = draggedColumnRef.current;
    if (!draggedColumn) {
      return;
    }

    if (action === 'hide') {
      apiRef.current.setColumnVisibility(draggedColumn.field, true);
      setAction('move');
    }
  });

  const preventClick = React.useCallback((event: MouseEvent) => {
    event.preventDefault();
  }, []);

  const pointerMove = React.useCallback((event: PointerEvent) => {
    if (!startPosition.current || !draggedColumnRef.current) {
      return;
    }
    const deltaX = event.clientX - startPosition.current.x;
    const deltaY = event.clientY - startPosition.current.y;
    const draggedColumn = getDraggedColumn();
    if (!draggedColumn) {
      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
        return;
      } else {
        setDraggedColumn(draggedColumnRef.current);
        document.documentElement.classList.add('dragging');
        document.body.addEventListener('keydown', onKeyDown);
        apiRef.current.publishEvent(
          'columnHeaderDragStart',
          draggedColumnRef.current,
          event as any,
        );
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
    }
    setPointerPosition({ x: event.clientX, y: event.clientY });
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
  }, []);

  const pointerUp = React.useCallback((event?: PointerEvent) => {
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
    startPosition.current = null;
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
  }, []);

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
      className="fixed flex gap-2 items-center top-0 left-0 z-9999 pointer-events-none px-cell bg-highlight border border-highlight-border backdrop-blur-sm min-w-[100px] font-medium rounded-grid"
      style={{
        transform: `translate3d(${pointer.x + 5}px, ${pointer.y + 5}px, 0)`,
        height: 36,
        lineHeight: 36,
      }}
    >
      {action === 'hide' ? (
        <HideIcon className="opacity-50" />
      ) : (
        <ArrowLeftRightIcon className="opacity-50" />
      )}
      {draggedColumn.colDef.headerName}
    </div>
  );
};

const HideIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={16}
    height={16}
    color={'currentColor'}
    fill={'none'}
    {...props}
  >
    <path
      d="M19.439 15.439C20.3636 14.5212 21.0775 13.6091 21.544 12.955C21.848 12.5287 22 12.3155 22 12C22 11.6845 21.848 11.4713 21.544 11.045C20.1779 9.12944 16.6892 5 12 5C11.0922 5 10.2294 5.15476 9.41827 5.41827M6.74742 6.74742C4.73118 8.1072 3.24215 9.94266 2.45604 11.045C2.15201 11.4713 2 11.6845 2 12C2 12.3155 2.15201 12.5287 2.45604 12.955C3.8221 14.8706 7.31078 19 12 19C13.9908 19 15.7651 18.2557 17.2526 17.2526"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.85786 10C9.32783 10.53 9 11.2623 9 12.0711C9 13.6887 10.3113 15 11.9289 15C12.7377 15 13.47 14.6722 14 14.1421"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M3 3L21 21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowLeftRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={16}
    height={16}
    color={'currentColor'}
    fill={'none'}
    {...props}
  >
    <path
      d="M19.9999 17L3.99994 17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 14C17 14 19.9999 16.2095 19.9999 17C19.9999 17.7906 16.9999 20 16.9999 20"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.99994 7L19.9999 7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.99991 4C6.99991 4 3.99994 6.20947 3.99994 7.00002C3.99993 7.79058 6.99994 10 6.99994 10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
