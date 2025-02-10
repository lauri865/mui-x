import clsx from 'clsx';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useGridRootProps } from '../../../hooks/utils/useGridRootProps';
import { isHideMenuKey } from '../../../utils/keyboardUtils';
import { GridColumnMenuContainerProps } from './GridColumnMenuProps';

function GridColumnMenuContainer(props: GridColumnMenuContainerProps) {
  const { hideMenu, colDef, id, labelledby, className, children, open, ...other } = props;

  const rootProps = useGridRootProps();

  const handleListKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault();
      }
      if (isHideMenuKey(event.key)) {
        hideMenu(event);
      }
    },
    [hideMenu],
  );

  // @ts-ignore
  const DropdownMenu = rootProps.slots.baseDropdownMenu;

  return (
    <DropdownMenu.Root
      id={id}
      className={clsx(`twg-menu`)}
      aria-labelledby={labelledby}
      open
      onOpenChange={(open) => {
        if (!open) {
          hideMenu();
        }
      }}
    >
      <DropdownMenu.Content>
        {labelledby}
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

GridColumnMenuContainer.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  colDef: PropTypes.object.isRequired,
  hideMenu: PropTypes.func.isRequired,
  id: PropTypes.string,
  labelledby: PropTypes.string,
  open: PropTypes.bool.isRequired,
} as any;

export { GridColumnMenuContainer };
