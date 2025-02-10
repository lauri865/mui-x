import { unstable_useForkRef as useForkRef } from '@mui/utils';
import { fastMemo } from '@mui/x-internals/fastMemo';
import { forwardRef } from '@mui/x-internals/forwardRef';
import clsx from 'clsx';
import * as React from 'react';
import { useThemedComponent } from '../../context/GridThemeContext';
import { useGridPrivateApiContext } from '../../hooks/utils/useGridPrivateApiContext';
import { useIsSSR } from '../../hooks/utils/useIsSSR';
import { GridHeader } from '../GridHeader';
import { GridBody, GridFooterPlaceholder } from '../base';

export interface GridRootProps extends React.HTMLAttributes<HTMLDivElement> {}

const GridRoot = forwardRef<HTMLDivElement, GridRootProps>(function GridRoot(props, ref) {
  const { className, children, ...other } = props;
  const apiRef = useGridPrivateApiContext();
  const rootElementRef = apiRef.current.rootElementRef;

  const rootMountCallback = React.useCallback(
    (node: HTMLElement | null) => {
      if (node === null) {
        return;
      }
      apiRef.current.publishEvent('rootMount', node);
    },
    [apiRef],
  );

  const handleRef = useForkRef(rootElementRef, ref, rootMountCallback);

  const classes = useThemedComponent('root');

  const isSSR = useIsSSR();

  if (isSSR) {
    return null;
  }

  return (
    <div className={clsx(classes.root, className)} ref={handleRef}>
      <GridHeader />
      <GridBody>{children}</GridBody>
      <GridFooterPlaceholder />
    </div>
  );
});

const MemoizedGridRoot = fastMemo(GridRoot);
export { MemoizedGridRoot as GridRoot };
