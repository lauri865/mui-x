import * as React from 'react';
import PropTypes from 'prop-types';
import {
  unstable_composeClasses as composeClasses,
  unstable_capitalize as capitalize,
} from '@mui/utils';
import clsx from 'clsx';
import { getDataGridUtilityClass } from '../../constants/gridClasses';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { gridDimensionsSelector } from '../../hooks/features/dimensions/gridDimensionsSelectors';
import { useThemedComponent } from '../../context/GridThemeContext';

enum GridColumnHeaderSeparatorSides {
  Left = 'left',
  Right = 'right',
}

export interface GridColumnHeaderSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  resizable: boolean;
  resizing: boolean;
  height: number;
  side?: GridColumnHeaderSeparatorSides;
}

type OwnerState = GridColumnHeaderSeparatorProps & {
  classes?: DataGridProcessedProps['classes'];
};

const useUtilityClasses = (ownerState: OwnerState) => {
  const { resizable, resizing, classes, side } = ownerState;

  const slots = {
    root: [
      'columnSeparator',
      resizable && 'columnSeparator--resizable',
      resizing && 'columnSeparator--resizing',
      side && `columnSeparator--side${capitalize(side)}`,
    ],
    icon: ['iconSeparator'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

function GridColumnHeaderSeparatorRaw(props: GridColumnHeaderSeparatorProps) {
  const apiRef = useGridApiContext();
  const [resizerHeight, setResizerHeight] = React.useState<number | null>(null);
  const {
    resizable,
    resizing,
    height,
    side = GridColumnHeaderSeparatorSides.Right,
    ...other
  } = props;
  const rootProps = useGridRootProps();
  const classes = useThemedComponent('columnSeparator');

  const stopClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setResizerHeight(null);
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div
      className={clsx(
        classes.root,
        'group/resizer text-grid-border hover:text-white active:text-white active:max-h-full h-full absolute cursor-col-resize px-1 z-1 hover:z-20 group-focus-within/cell:text-highlight-border active:[anchor-name:--resizer]',
        side === GridColumnHeaderSeparatorSides.Left && '-left-[5px] twg-columnSeparator--sideLeft',
        side === GridColumnHeaderSeparatorSides.Right &&
          '-right-1 group-data-last-pinned-left/cell:-right-[5px] twg-columnSeparator--sideRight',
        !rootProps.showColumnVerticalBorder && 'max-h-[20px]',
        !resizable && 'pointer-events-none',
        resizable && 'twg-columnSeparator--resizable',
      )}
      {...other}
      onClick={stopClick}
      onPointerDown={(event) => {
        event.stopPropagation();
        setResizerHeight(gridDimensionsSelector(apiRef.current.state).viewportOuterSize.height);
      }}
    >
      <div className="w-px bg-current h-full" />
      {resizerHeight && (
        <div
          className="w-px bg-white top-[anchor(top)] hidden group-active/resizer:[position-anchor:--resizer] group-active/resizer:flex pointer-events-none z-10 absolute"
          style={{
            height: resizerHeight,
          }}
        />
      )}
    </div>
  );
}

const GridColumnHeaderSeparator = React.memo(GridColumnHeaderSeparatorRaw);

GridColumnHeaderSeparatorRaw.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  height: PropTypes.number.isRequired,
  resizable: PropTypes.bool.isRequired,
  resizing: PropTypes.bool.isRequired,
  side: PropTypes.oneOf(['left', 'right']),
} as any;

export { GridColumnHeaderSeparator, GridColumnHeaderSeparatorSides };
