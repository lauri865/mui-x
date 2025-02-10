import * as React from 'react';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';

export interface GridMenuProps {
  open: boolean;
  target: HTMLElement | null;
  onClose: (event?: Event) => void;
  children: React.ReactNode;
}

function GridMenu(props: GridMenuProps) {
  const { open, target, onClose, children, position, className, onExited, ...other } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();

  throw new Error('Not implemented');
  return children;
}

export { GridMenu };
