import clsx from 'clsx';
import * as React from 'react';
import { useThemedComponent } from '../../context/GridThemeContext';
import { useGridOverlays } from '../../hooks/features/overlays/useGridOverlays';
import { useGridVirtualScroller } from '../../hooks/features/virtualization/useGridVirtualScroller';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { useGridSelector } from '../../hooks/utils/useGridSelector';
import {
  gridHasBottomFillerSelector,
  gridHasFillerSelector,
  gridHasScrollXSelector,
  gridHasScrollYSelector,
  gridVerticalScrollbarWidthSelector,
} from '../../internals/selectors/dimensionSelectors';
import { GridStateCommunity } from '../../models/gridStateCommunity';
import { GridContextMenu } from '../contextMenu/GridContextMenu';
import { GridDragDrop } from '../dragdrop/GridDragDrop';
import { GridHeaders } from '../GridHeaders';
import { GridScrollArea } from '../GridScrollArea';
import { GridBottomContainer as BottomContainer } from './GridBottomContainer';
import { GridTopContainer as TopContainer } from './GridTopContainer';
import { GridVirtualScrollbar as Scrollbar } from './GridVirtualScrollbar';
import { GridVirtualScrollerContent as Content } from './GridVirtualScrollerContent';
import { GridVirtualScrollerFiller as SpaceFiller } from './GridVirtualScrollerFiller';
import { GridVirtualScrollerRenderZone as RenderZone } from './GridVirtualScrollerRenderZone';

const hasPinnedRightSelector = (state: GridStateCommunity) => state.dimensions.rightPinnedWidth > 0;

export interface GridVirtualScrollerProps {
  children?: React.ReactNode;
}

function GridVirtualScroller(props: GridVirtualScrollerProps) {
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const hasScrollY = useGridSelector(apiRef, gridHasScrollYSelector);
  const hasScrollX = useGridSelector(apiRef, gridHasScrollXSelector);
  const scrollbarYSize = gridVerticalScrollbarWidthSelector(apiRef.current.state);
  const hasHorizontalFiller = useGridSelector(apiRef, gridHasFillerSelector);
  const hasPinnedRight = useGridSelector(apiRef, hasPinnedRightSelector);
  const hasBottomFiller = useGridSelector(apiRef, gridHasBottomFillerSelector);
  const { getOverlay, overlaysProps } = useGridOverlays();

  const virtualScroller = useGridVirtualScroller();

  const {
    getContainerProps,
    getScrollerProps,
    getContentProps,
    getRenderZoneProps,
    getScrollbarVerticalProps,
    getScrollbarHorizontalProps,
    getRows,
    getScrollAreaProps,
  } = virtualScroller;

  const rows = getRows();

  const classes = useThemedComponent('main');

  return (
    <div
      className={clsx(
        classes.root,
        overlaysProps.loadingOverlayVariant === 'skeleton' && classes.variants.skeleton,
      )}
      {...getContainerProps()}
      data-scroll-x={hasScrollX || undefined}
      data-scroll-y={hasScrollY || undefined}
      data-fullwidth={
        hasHorizontalFiller === false || (hasPinnedRight && !scrollbarYSize) || undefined
      }
    >
      <GridDragDrop />
      <GridScrollArea scrollDirection="left" {...getScrollAreaProps()} />
      <GridScrollArea scrollDirection="right" {...getScrollAreaProps()} />
      <GridContextMenu />
      <div
        className={clsx('twg-virtualScroller', classes.variants.scroller)}
        {...getScrollerProps()}
      >
        <TopContainer>
          {!rootProps.unstable_listView && <GridHeaders />}
          {getOverlay()}
          <rootProps.slots.pinnedRows position="top" virtualScroller={virtualScroller} />
        </TopContainer>

        <Content {...getContentProps()}>
          <RenderZone {...getRenderZoneProps()}>{rows}</RenderZone>
        </Content>

        {hasBottomFiller && <SpaceFiller rowsLength={rows.length} />}
        <BottomContainer>
          <rootProps.slots.pinnedRows position="bottom" virtualScroller={virtualScroller} />
        </BottomContainer>
      </div>
      {hasScrollX && !rootProps.unstable_listView && (
        <Scrollbar position="horizontal" {...getScrollbarHorizontalProps()} />
      )}
      {hasScrollY && <Scrollbar position="vertical" {...getScrollbarVerticalProps()} />}
      {props.children}
    </div>
  );
}

export { GridVirtualScroller };
