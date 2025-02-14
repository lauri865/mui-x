import * as React from 'react';
import { GridColumnMenuItemProps } from '../GridColumnMenuItemProps';
import { GridColumnMenuAutoSizeItem } from './GridColumnMenuAutoSizeItem';
import { GridColumnMenuHideItem } from './GridColumnMenuHideItem';
import { GridColumnMenuManageItem } from './GridColumnMenuManageItem';

function GridColumnMenuColumnsItem(props: GridColumnMenuItemProps) {
  return (
    <React.Fragment>
      <GridColumnMenuAutoSizeItem {...props} />
      <GridColumnMenuHideItem {...props} />
      <GridColumnMenuManageItem {...props} />
    </React.Fragment>
  );
}

export { GridColumnMenuColumnsItem };
