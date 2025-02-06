import * as React from 'react';
import { useThemedComponent } from '../../context/GridThemeContext';
import {
  gridHasBottomFillerSelector,
  gridHasFillerSelector,
  gridHasScrollXSelector,
  gridHasScrollYSelector,
} from '../../internals/selectors/dimensionSelectors';
import { GridScrollArea } from '../GridScrollArea';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridSelector } from '../../hooks/utils/useGridSelector';
import { useGridVirtualScroller } from '../../hooks/features/virtualization/useGridVirtualScroller';
import { useGridOverlays } from '../../hooks/features/overlays/useGridOverlays';
import { GridHeaders } from '../GridHeaders';
import { GridTopContainer as TopContainer } from './GridTopContainer';
import { GridBottomContainer as BottomContainer } from './GridBottomContainer';
import { GridVirtualScrollerContent as Content } from './GridVirtualScrollerContent';
import { GridVirtualScrollerFiller as SpaceFiller } from './GridVirtualScrollerFiller';
import { GridVirtualScrollerRenderZone as RenderZone } from './GridVirtualScrollerRenderZone';
import { GridVirtualScrollbar as Scrollbar } from './GridVirtualScrollbar';
import { GridStateCommunity } from '../../models/gridStateCommunity';
import { GridDragDrop } from '../dragdrop/GridDragDrop';

const hasPinnedRightSelector = (state: GridStateCommunity) => state.dimensions.rightPinnedWidth > 0;

export interface GridVirtualScrollerProps {
  children?: React.ReactNode;
}

function GridVirtualScroller(props: GridVirtualScrollerProps) {
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const hasScrollY = useGridSelector(apiRef, gridHasScrollYSelector);
  const hasScrollX = useGridSelector(apiRef, gridHasScrollXSelector);
  const hasHorizontalFiller = useGridSelector(apiRef, gridHasFillerSelector);
  const hasPinnedRight = useGridSelector(apiRef, hasPinnedRightSelector);
  const hasBottomFiller = useGridSelector(apiRef, gridHasBottomFillerSelector);
  const { getOverlay, overlaysProps } = useGridOverlays();
  const ownerState = {
    classes: rootProps.classes,
    hasScrollX,
    hasPinnedRight,
    loadingOverlayVariant: overlaysProps.loadingOverlayVariant,
  };

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
      className={classes.root}
      {...getContainerProps()}
      data-scroll-x={hasScrollX || undefined}
      data-scroll-y={hasScrollY || undefined}
      data-fullwidth={!hasHorizontalFiller || undefined}
    >
      <GridDragDrop />
      <GridScrollArea scrollDirection="left" {...getScrollAreaProps()} />
      <GridScrollArea scrollDirection="right" {...getScrollAreaProps()} />
      <div className={classes.variants.scroller} {...getScrollerProps()}>
        <TopContainer>
          {!rootProps.unstable_listView && <GridHeaders />}
          <rootProps.slots.pinnedRows position="top" virtualScroller={virtualScroller} />
        </TopContainer>

        {getOverlay()}

        <Content {...getContentProps()}>
          <RenderZone {...getRenderZoneProps()}>
            {rows}
            {<rootProps.slots.detailPanels virtualScroller={virtualScroller} />}
          </RenderZone>
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
