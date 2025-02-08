import * as React from 'react';
import clsx from 'clsx';
import { unstable_useForkRef as useForkRef } from '@mui/utils';
import { forwardRef } from '@mui/x-internals/forwardRef';
import { GridStateColDef } from '../../models/colDef/gridColDef';
import { GridSortDirection } from '../../models/gridSortModel';
import { useGridPrivateApiContext } from '../../hooks/utils/useGridPrivateApiContext';
import {
  GridColumnHeaderSeparator,
  GridColumnHeaderSeparatorProps,
} from './GridColumnHeaderSeparator';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { GridColumnGroup } from '../../models/gridColumnGrouping';
import { isOverflown } from '../../utils/domUtils';
import { gridClasses } from '../../constants/gridClasses';

interface GridGenericColumnHeaderItemProps
  extends Pick<GridStateColDef, 'headerClassName' | 'description' | 'resizable'> {
  classes: Record<
    'root' | 'draggableContainer' | 'titleContainer' | 'titleContainerContent' | 'title',
    string
  >;
  colIndex: number;
  columnMenuOpen: boolean;
  height: number;
  isResizing: boolean;
  sortDirection: GridSortDirection;
  sortIndex?: number;
  filterItemsCounter?: number;
  hasFocus?: boolean;
  tabIndex: 0 | -1;
  disableReorder?: boolean;
  separatorSide?: GridColumnHeaderSeparatorProps['side'];
  headerComponent?: React.ReactNode;
  elementId: GridStateColDef['field'] | GridColumnGroup['groupId'];
  width: number;
  columnMenuIconButton?: React.ReactNode;
  columnMenu?: React.ReactNode;
  columnTitleIconButtons?: React.ReactNode;
  label: string;
  columnHeaderSeparatorProps?: Partial<GridColumnHeaderSeparatorProps>;
  style?: React.CSSProperties;
}

const GridGenericColumnHeaderItem = forwardRef<HTMLDivElement, GridGenericColumnHeaderItemProps>(
  function GridGenericColumnHeaderItem(props, ref) {
    const {
      classes,
      columnMenuOpen,
      colIndex,
      height,
      isResizing,
      sortDirection,
      hasFocus,
      tabIndex,
      separatorSide,
      headerComponent,
      description,
      elementId,
      width,
      columnMenuIconButton = null,
      columnMenu = null,
      columnTitleIconButtons = null,
      headerClassName,
      label,
      resizable,
      columnHeaderSeparatorProps,
      style,
      ...other
    } = props;

    const apiRef = useGridPrivateApiContext();
    const rootProps = useGridRootProps();
    const headerCellRef = React.useRef<HTMLDivElement>(null);
    const labelRef = React.useRef<HTMLDivElement>(null);

    const [tooltip, setTooltip] = React.useState('');

    const handleMouseOver = React.useCallback<React.MouseEventHandler<HTMLDivElement>>(() => {
      if (!description && labelRef?.current) {
        const isOver = isOverflown(labelRef.current);
        if (isOver) {
          setTooltip(label);
        } else {
          setTooltip('');
        }
      }
    }, [description, label]);

    const handleRef = useForkRef(headerCellRef, ref);

    let ariaSort: 'ascending' | 'descending' | 'none' = 'none';
    if (sortDirection != null) {
      ariaSort = sortDirection === 'asc' ? 'ascending' : 'descending';
    }

    React.useLayoutEffect(() => {
      const columnMenuState = apiRef.current.state.columnMenu;
      if (hasFocus && !columnMenuState.open) {
        const focusableElement =
          headerCellRef.current!.querySelector<HTMLElement>('[tabindex="0"]');
        const elementToFocus = focusableElement || headerCellRef.current;
        elementToFocus?.focus();
        if (apiRef.current.columnHeadersContainerRef?.current) {
          apiRef.current.columnHeadersContainerRef.current.scrollLeft = 0;
        }
      }
    }, [apiRef, hasFocus]);

    return (
      <rootProps.slots.baseTooltip title={tooltip} sideOffset={4}>
        <div
          className={clsx(classes.root, headerClassName)}
          style={{
            ...style,
            height,
            width,
          }}
          role="columnheader"
          tabIndex={tabIndex}
          aria-colindex={colIndex + 1}
          aria-sort={ariaSort}
          {...other}
          ref={handleRef}
        >
          <div
            className={clsx(classes.titleContainer, gridClasses.columnHeaderTitleContainer)}
            role="presentation"
          >
            {headerComponent !== undefined ? (
              headerComponent
            ) : (
              <div
                className={clsx(classes.title, gridClasses.columnHeaderTitle)}
                ref={labelRef}
                onPointerOver={handleMouseOver}
              >
                {label}
              </div>
            )}
          </div>

          {(columnTitleIconButtons || columnMenuIconButton || columnMenu) && (
            <div className="toolbar flex gap-0.5 justify-end group-data-[align=right]/cell:flex-row-reverse px-1.5 empty:hidden">
              {columnTitleIconButtons}
              {columnMenuIconButton}
            </div>
          )}

          <GridColumnHeaderSeparator
            resizable={!rootProps.disableColumnResize && !!resizable}
            resizing={isResizing}
            height={height}
            side={separatorSide}
            {...columnHeaderSeparatorProps}
          />
        </div>
      </rootProps.slots.baseTooltip>
    );
  },
);

export { GridGenericColumnHeaderItem };
