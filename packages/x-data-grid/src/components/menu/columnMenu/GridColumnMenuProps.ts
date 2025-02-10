import * as React from 'react';
import { GridColumnMenuRootProps } from '../../../hooks/features/columnMenu';
import { GridColDef } from '../../../models/colDef/gridColDef';

export interface GridColumnMenuContainerProps extends React.HTMLAttributes<HTMLUListElement> {
  showMenu: () => void;
  hideMenu: () => void;
  colDef: GridColDef;
  open: boolean;
  id?: string;
  labelledby?: string;
  children: React.ReactNode;
}

export interface GridGenericColumnMenuProps
  extends GridColumnMenuRootProps,
    GridColumnMenuContainerProps {}

export interface GridColumnMenuProps
  extends Omit<GridColumnMenuContainerProps, 'defaultSlots' | 'defaultSlotProps'> {}
