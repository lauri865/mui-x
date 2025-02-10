import {
  unstable_useEventCallback as useEventCallback,
  unstable_useForkRef as useForkRef,
} from '@mui/utils';
import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import * as React from 'react';
import { gridDimensionsSelector, useGridSelector } from '../../hooks';
import { useGridPrivateApiContext } from '../../hooks/utils/useGridPrivateApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { useOnMount } from '../../hooks/utils/useOnMount';

type Position = 'vertical' | 'horizontal';
type GridVirtualScrollbarProps = {
  position: Position;
  scrollPosition: React.RefObject<{
    left: number;
    top: number;
  }>;
};

const GridVirtualScrollbar = forwardRef<HTMLDivElement, GridVirtualScrollbarProps>(
  function GridVirtualScrollbar(props, ref) {
    const apiRef = useGridPrivateApiContext();
    const rootProps = useGridRootProps();
    const isLocked = React.useRef(false);
    const lastPosition = React.useRef(0);
    const scrollbarRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const dimensions = useGridSelector(apiRef, gridDimensionsSelector);

    const propertyDimension = props.position === 'vertical' ? 'height' : 'width';
    const propertyScroll = props.position === 'vertical' ? 'scrollTop' : 'scrollLeft';
    const propertyScrollPosition = props.position === 'vertical' ? 'top' : 'left';
    const hasScroll = props.position === 'vertical' ? dimensions.hasScrollX : dimensions.hasScrollY;

    const scrollbarInnerSize =
      props.position === 'horizontal'
        ? dimensions.minimumSize[propertyDimension]
        : dimensions.minimumSize[propertyDimension] -
          dimensions.headersTotalHeight -
          (dimensions.hasScrollX ? dimensions.scrollbarSize : 0);

    const onScrollerScroll = useEventCallback(() => {
      const scrollbar = scrollbarRef.current;
      const scrollPosition = props.scrollPosition.current;

      if (!scrollbar) {
        return;
      }

      if (scrollPosition[propertyScrollPosition] === lastPosition.current) {
        return;
      }

      lastPosition.current = scrollPosition[propertyScrollPosition];

      if (isLocked.current) {
        isLocked.current = false;
        return;
      }
      isLocked.current = true;

      requestAnimationFrame(() => {
        scrollbar[propertyScroll] = scrollPosition[propertyScrollPosition];
      });
    });

    const onScrollbarScroll = useEventCallback(() => {
      const scroller = apiRef.current.virtualScrollerRef.current!;
      const scrollbar = scrollbarRef.current;

      if (!scrollbar) {
        return;
      }

      if (isLocked.current) {
        isLocked.current = false;
        return;
      }
      isLocked.current = true;

      scroller[propertyScroll] = scrollbar[propertyScroll];
    });

    useOnMount(() => {
      const scroller = apiRef.current.virtualScrollerRef.current!;
      const scrollbar = scrollbarRef.current!;
      const options: AddEventListenerOptions = { passive: true };
      scroller.addEventListener('scroll', onScrollerScroll, options);
      scrollbar.addEventListener('scroll', onScrollbarScroll, options);
      return () => {
        scroller.removeEventListener('scroll', onScrollerScroll, options);
        scrollbar.removeEventListener('scroll', onScrollbarScroll, options);
      };
    });

    React.useEffect(() => {
      const content = contentRef.current!;
      content.style.setProperty(propertyDimension, `${scrollbarInnerSize}px`);
    }, [scrollbarInnerSize, propertyDimension]);

    return (
      <div
        ref={useForkRef(ref, scrollbarRef)}
        className={clsx(
          'absolute inline-block z-6 hover:z-7 [--size:calc(max(var(--DataGrid-scrollbarSize),14px))]',
          props.position === 'vertical' &&
            'w-[var(--size)] h-[calc(var(--DataGrid-hasScrollY)*(100%-var(--DataGrid-headerHeight)-var(--DataGrid-hasScrollX)*var(--DataGrid-scrollbarSize)))] overflow-y-auto overflow-x-hidden outline-0 top-[var(--DataGrid-headerHeight)] right-0 [&>div]:w-[var(--size)]',
          props.position === 'horizontal' &&
            'w-full h-[var(--size)] overflow-y-hidden overflow-x-auto outline-0 bottom-0 [&>div]:h-[var(--size)]',
        )}
        style={
          props.position === 'vertical' && rootProps.unstable_listView
            ? { height: '100%', top: 0 }
            : undefined
        }
        tabIndex={-1}
        aria-hidden="true"
      >
        <div ref={contentRef} style={{ [propertyDimension]: `${scrollbarInnerSize}px` }} />
      </div>
    );
  },
);

export { GridVirtualScrollbar };
