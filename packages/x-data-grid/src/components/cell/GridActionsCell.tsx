import { unstable_useId as useId } from '@mui/utils';
import clsx from 'clsx';
import * as React from 'react';
import { gridClasses } from '../../constants/gridClasses';
import { useGridApiContext } from '../../hooks/utils/useGridApiContext';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { useRtl } from '../../hooks/utils/useRtl';
import { GridActionsColDef } from '../../models/colDef/gridColDef';
import { GridRenderCellParams } from '../../models/params/gridCellParams';

const hasActions = (colDef: any): colDef is GridActionsColDef =>
  typeof colDef.getActions === 'function';

interface GridActionsCellProps extends Omit<GridRenderCellParams, 'api'> {
  api?: GridRenderCellParams['api'];
}

function GridActionsCell(props: GridActionsCellProps) {
  const {
    api,
    colDef,
    id,
    hasFocus,
    isEditable,
    field,
    value,
    formattedValue,
    row,
    rowNode,
    cellMode,
    tabIndex,
    focusElementRef,
    ...other
  } = props;
  const [focusedButtonIndex, setFocusedButtonIndex] = React.useState(-1);
  const apiRef = useGridApiContext();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const ignoreCallToFocus = React.useRef(false);
  const isRtl = useRtl();
  const buttonId = useId();
  const rootProps = useGridRootProps();

  if (!hasActions(colDef)) {
    throw new Error('TWGrid: Missing the `getActions` property in the `GridColDef`.');
  }

  const DropdownMenu = rootProps.slots.baseDropdownMenu;
  const options = colDef.getActions(apiRef.current.getRowParams(id), {
    api: apiRef.current,
    Button: rootProps.slots.baseButton,
    IconButton: (props) => (
      <rootProps.slots.baseIconButton {...props} className={clsx('size-6', props.className)} />
    ),
    MenuItem: DropdownMenu.Item,
    MenuSeparator: DropdownMenu.Separator,
  });
  const iconButtons = options.filter(
    (option) => option.type !== DropdownMenu.Item && option.type !== DropdownMenu.Separator,
  );
  const menuItems = options.filter((option) => option.type === DropdownMenu.Item);
  const numberOfButtons = iconButtons.length + (menuItems.length ? 1 : 0);

  React.useEffect(() => {
    if (focusedButtonIndex < 0 || !rootRef.current) {
      return;
    }

    if (focusedButtonIndex >= rootRef.current.children.length) {
      return;
    }

    const child = rootRef.current.children[focusedButtonIndex] as HTMLElement;
    child.focus({ preventScroll: true });
  }, [focusedButtonIndex]);

  React.useEffect(() => {
    if (!hasFocus) {
      setFocusedButtonIndex(-1);
      ignoreCallToFocus.current = false;
    }
  }, [hasFocus]);

  React.useImperativeHandle(
    focusElementRef,
    () => ({
      focus() {
        // If ignoreCallToFocus is true, then one of the buttons was clicked and the focus is already set
        if (!ignoreCallToFocus.current) {
          // find the first focusable button and pass the index to the state
          const focusableButtonIndex = options.findIndex((o) => !o.props.disabled);
          setFocusedButtonIndex(focusableButtonIndex);
        }
      },
    }),
    [options],
  );

  React.useEffect(() => {
    if (focusedButtonIndex >= numberOfButtons) {
      setFocusedButtonIndex(numberOfButtons - 1);
    }
  }, [focusedButtonIndex, numberOfButtons]);

  const handleButtonClick =
    (index: number, onClick?: React.MouseEventHandler): React.MouseEventHandler =>
    (event) => {
      setFocusedButtonIndex(index);
      ignoreCallToFocus.current = true;

      if (onClick) {
        onClick(event);
      }
    };

  console.log(focusedButtonIndex);

  const handleRootKeyDown = (event: React.KeyboardEvent) => {
    if (numberOfButtons <= 1) {
      return;
    }

    const getNewIndex = (index: number, direction: 'left' | 'right'): number => {
      if (index < 0 || index > options.length) {
        return index;
      }

      // for rtl mode we need to reverse the direction
      const rtlMod = isRtl ? -1 : 1;
      const indexMod = (direction === 'left' ? -1 : 1) * rtlMod;

      // if the button that should receive focus is disabled go one more step
      return options[index + indexMod]?.props.disabled
        ? getNewIndex(index + indexMod, direction)
        : index + indexMod;
    };

    let newIndex: number = focusedButtonIndex;
    if (event.key === 'ArrowRight') {
      newIndex = getNewIndex(focusedButtonIndex, 'right');
    } else if (event.key === 'ArrowLeft') {
      newIndex = getNewIndex(focusedButtonIndex, 'left');
    }

    if (newIndex < 0 || newIndex >= numberOfButtons) {
      return; // We're already in the first or last item = do nothing and let the grid listen the event
    }

    if (newIndex !== focusedButtonIndex) {
      event.preventDefault(); // Prevent scrolling
      event.stopPropagation(); // Don't stop propagation for other keys, for example ArrowUp
      setFocusedButtonIndex(newIndex);
    }
  };

  return (
    <div
      role="menu"
      ref={rootRef}
      tabIndex={-1}
      className={clsx(gridClasses.actionsCell, 'flex gap-1 items-center')}
      onKeyDown={handleRootKeyDown}
      {...other}
    >
      {iconButtons.map((button, index) =>
        React.cloneElement(button, {
          key: index,
          tabIndex: focusedButtonIndex === index ? tabIndex : -1,
        }),
      )}
      {menuItems.length > 0 && (
        <DropdownMenu.Root
          onOpenChange={(open) => {
            if (open) {
              setFocusedButtonIndex(numberOfButtons - 1);
              ignoreCallToFocus.current = true;
            }
          }}
        >
          <DropdownMenu.Trigger
            asChild
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
              }
            }}
          >
            <rootProps.slots.baseIconButton
              ref={buttonRef}
              id={buttonId}
              aria-label={apiRef.current.getLocaleText('actionsCellMore')}
              tabIndex={focusedButtonIndex === iconButtons.length ? tabIndex : -1}
              className="size-6"
              {...rootProps.slotProps?.baseIconButton}
            >
              <rootProps.slots.moreActionsIcon fontSize="small" />
            </rootProps.slots.baseIconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            {menuItems.map((button, index) => React.cloneElement(button, { key: index }))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      )}
    </div>
  );
}

export { GridActionsCell };

export const renderActionsCell = (params: GridRenderCellParams) => <GridActionsCell {...params} />;
