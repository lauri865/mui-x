import { fastMemo } from '@mui/x-internals/fastMemo';
import clsx from 'clsx';
import * as React from 'react';
import { useThemedComponent } from '../context/GridThemeContext';
import { gridDimensionsSelector } from '../hooks';
import { useGridPrivateApiContext } from '../hooks/utils/useGridPrivateApiContext';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';
import { GridRowId } from '../models';

export interface GridDetailPanelsProps {
  rowId: GridRowId;
  borderTop?: boolean;
  borderBottom?: boolean;
}

const GridDetailPanelImpl = (props: GridDetailPanelsProps) => {
  const apiRef = useGridPrivateApiContext();
  const [height, setHeight] = React.useState<number>(0);
  const [mode, setMode] = React.useState<'sticky' | 'static'>('sticky');
  const enableTransition = React.useRef(
    apiRef.current.caches.detailPanel.expandingRowIds.has(props.rowId),
  );
  const rootProps = useGridRootProps();
  const rowParams = apiRef.current.getRowParams(props.rowId);
  const classes = useThemedComponent('detailPanel', {
    borderTop: props.borderTop,
    borderBottom: props.borderBottom,
    [mode]: true,
  });
  const observerRef = React.useRef<ResizeObserver | null>(null);

  const borderHeight = (props.borderTop ? 1 : 0) + (props.borderBottom ? 1 : 0);
  const handleRef = React.useCallback(
    (node: HTMLElement | null) => {
      if (!node) {
        if (observerRef.current) {
          observerRef.current.disconnect();
          observerRef.current = null;
        }
        return;
      }

      const height = node.getBoundingClientRect().height + borderHeight;
      setHeight(height);
      apiRef.current.setDetailPanelHeight(props.rowId, height);
      let contentWidth = 0;
      const observer = new ResizeObserver((entries) => {
        const observedHeight = entries[0].borderBoxSize[0].blockSize + borderHeight;
        if (!observedHeight) {
          return;
        }
        apiRef.current.setDetailPanelHeight(props.rowId, observedHeight);
        setHeight(observedHeight);

        if (entries.length === 2) {
          contentWidth = entries[1].borderBoxSize[0].inlineSize;
        }

        if (!contentWidth) {
          return;
        }

        const dimensions = gridDimensionsSelector(apiRef.current.state);
        const containerWidth = dimensions.viewportInnerSize.width;
        const mode = containerWidth > contentWidth ? 'sticky' : 'static';
        setMode(mode);
      });
      observer.observe(node);
      observer.observe(node.firstChild as HTMLElement);
      observerRef.current = observer;

      return () => {
        observer.disconnect();
        observerRef.current = null;
      };
    },
    [apiRef, borderHeight],
  );

  React.useEffect(() => {
    if (height !== 0) {
      enableTransition.current = false;
      apiRef.current.caches.detailPanel.expandingRowIds.delete(props.rowId);
    }
  }, [height]);

  React.useEffect(() => {
    return () => {
      apiRef.current.caches.detailPanel.expandingRowIds.delete(props.rowId);
    };
  }, []);

  if (!rootProps.getDetailPanelContent) {
    return null;
  }

  console.log('render');

  return (
    <div
      className={clsx(classes.root, enableTransition.current && 'transition-[height] ease-in-out')}
      style={{
        height: Math.max(borderHeight + 1, height),
        opacity: height === 0 ? 0 : 1,
        transitionDuration:
          enableTransition.current && height > 0 ? Math.min(0.5, height / 500) + 's' : undefined,
      }}
    >
      <div className={clsx(classes.variants.content)} ref={handleRef}>
        <div className="w-max">{rootProps.getDetailPanelContent(rowParams)}</div>
      </div>
    </div>
  );
};

export const GridDetailPanel = fastMemo(GridDetailPanelImpl);
