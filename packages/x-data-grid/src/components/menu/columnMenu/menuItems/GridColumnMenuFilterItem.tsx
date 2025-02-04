import * as React from 'react';
import PropTypes from 'prop-types';
import { useGridApiContext } from '../../../../hooks/utils/useGridApiContext';
import { GridColumnMenuItemProps } from '../GridColumnMenuItemProps';
import { useGridRootProps } from '../../../../hooks/utils/useGridRootProps';

function GridColumnMenuFilterItem(props: GridColumnMenuItemProps) {
  const { colDef, onClick } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();

  const showFilter = React.useCallback(
    (event: Event) => {
      apiRef.current.showFilterPanel(colDef.field);
    },
    [apiRef, colDef.field, onClick],
  );

  if (rootProps.disableColumnFilter || !colDef.filterable) {
    return null;
  }

  const DropdownMenu = rootProps.slots.baseDropdownMenu;

  return (
    <DropdownMenu.Item onSelect={showFilter}>
      <rootProps.slots.columnMenuFilterIcon />
      {apiRef.current.getLocaleText('columnMenuFilter')}
    </DropdownMenu.Item>
  );
}

GridColumnMenuFilterItem.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  colDef: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
} as any;

export { GridColumnMenuFilterItem };
