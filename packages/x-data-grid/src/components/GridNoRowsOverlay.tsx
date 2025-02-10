import * as React from 'react';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { GridOverlay, GridOverlayProps } from './containers/GridOverlay';

const GridNoRowsOverlay = forwardRef<HTMLDivElement, GridOverlayProps>(
  function GridNoRowsOverlay(props, ref) {
    const apiRef = useGridApiContext();
    const noRowsLabel = apiRef.current.getLocaleText('noRowsLabel');

    return (
      <GridOverlay {...props} ref={ref}>
        {noRowsLabel}
      </GridOverlay>
    );
  },
);

export { GridNoRowsOverlay };
