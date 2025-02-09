import * as React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  unstable_composeClasses as composeClasses,
  unstable_capitalize as capitalize,
} from '@mui/utils';
import { fastMemo } from '@mui/x-internals/fastMemo';
import { createRandomNumberGenerator } from '../../utils/utils';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { getDataGridUtilityClass } from '../../constants/gridClasses';
import { DataGridProcessedProps } from '../../models/props/DataGridProps';
import { GridColType } from '../../models';
import { PinnedColumnPosition } from '../../internals/constants';
import { useRtl } from '@mui/system/RtlProvider';
import { attachPinnedStyle } from '../../internals/utils';
import { useThemedComponent } from '../../context/GridThemeContext';
import { gridPinnedColumnPositionLookup } from './GridCell';

const CIRCULAR_CONTENT_SIZE = '1.3em';

const CONTENT_HEIGHT = '1.2em';

const DEFAULT_CONTENT_WIDTH_RANGE = [40, 80] as const;

const CONTENT_WIDTH_RANGE_BY_TYPE: Partial<Record<GridColType, [number, number]>> = {
  number: [40, 60],
  string: [40, 80],
  date: [40, 60],
  dateTime: [60, 80],
  singleSelect: [40, 80],
} as const;

export interface GridSkeletonCellProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: GridColType;
  width?: number | string;
  height?: number | 'auto';
  field?: string;
  align?: string;
  /**
   * If `true`, the cell will not display the skeleton but still reserve the cell space.
   * @default false
   */
  empty?: boolean;
  colIndex?: number;
  pinnedPosition?: PinnedColumnPosition;
  pinnedOffset?: number;
  showLeftBorder?: boolean;
  showRightBorder?: boolean;
}

const randomNumberGenerator = createRandomNumberGenerator(12345);

function GridSkeletonCell(props: GridSkeletonCellProps) {
  const {
    field,
    colIndex,
    type,
    align,
    width,
    height,
    empty = false,
    style,
    className,
    pinnedPosition,
    pinnedOffset,
    showLeftBorder,
    showRightBorder,
    ...other
  } = props;
  const rootProps = useGridRootProps();
  const isRtl = useRtl();

  const classes = useThemedComponent('cell', {
    pinned:
      pinnedPosition === PinnedColumnPosition.LEFT || pinnedPosition === PinnedColumnPosition.RIGHT,
    showRightBorder,
    showLeftBorder,
    left: align === 'left',
    center: align === 'center',
    right: align === 'right',
    flex: true,
  });

  const pinnedStyle = attachPinnedStyle({}, isRtl, pinnedPosition, pinnedOffset);

  // Memo prevents the non-circular skeleton widths changing to random widths on every render
  const skeletonProps = React.useMemo(() => {
    const isCircularContent = type === 'boolean' || type === 'actions';

    if (isCircularContent) {
      return {
        variant: 'circular',
        width: CIRCULAR_CONTENT_SIZE,
        height: CIRCULAR_CONTENT_SIZE,
      } as const;
    }

    // The width of the skeleton is a random number between the min and max values
    // The min and max values are determined by the type of the column
    const [min, max] = type
      ? (CONTENT_WIDTH_RANGE_BY_TYPE[type] ?? DEFAULT_CONTENT_WIDTH_RANGE)
      : DEFAULT_CONTENT_WIDTH_RANGE;

    return {
      variant: 'text',
      width: `${Math.round(randomNumberGenerator(min, max))}%`,
      height: CONTENT_HEIGHT,
    } as const;
  }, [type]);

  return (
    <div
      data-field={field}
      data-colindex={colIndex}
      className={clsx(classes.root, className)}
      style={
        {
          height,
          '--width': `${width}px`,
          width: 'var(--width)',
          ...pinnedStyle,
          ...style,
        } as React.CSSProperties
      }
      data-pinned={(pinnedPosition && gridPinnedColumnPositionLookup[pinnedPosition]) || undefined}
      data-align={align}
      {...other}
    >
      {!empty && <rootProps.slots.baseSkeleton {...skeletonProps} />}
    </div>
  );
}

GridSkeletonCell.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "pnpm proptypes"  |
  // ----------------------------------------------------------------------
  align: PropTypes.string,
  /**
   * If `true`, the cell will not display the skeleton but still reserve the cell space.
   * @default false
   */
  empty: PropTypes.bool,
  field: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.oneOf(['auto']), PropTypes.number]),
  type: PropTypes.oneOf([
    'actions',
    'boolean',
    'custom',
    'date',
    'dateTime',
    'number',
    'singleSelect',
    'string',
  ]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
} as any;

const Memoized = fastMemo(GridSkeletonCell);

export { Memoized as GridSkeletonCell };
