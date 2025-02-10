import * as React from 'react';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';

export interface GridColumnsPanelProps {}

function GridColumnsPanel(props: GridColumnsPanelProps) {
  const rootProps = useGridRootProps();
  return <rootProps.slots.columnsManagement {...rootProps.slotProps?.columnsManagement} />;
}

export { GridColumnsPanel };
