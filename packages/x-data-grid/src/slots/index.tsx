import {
  Button,
  Checkbox,
  ContextMenu,
  DropdownMenu,
  icons,
  Input,
  Label,
  Popover,
  Tooltip,
} from '@twgrid/x-data-grid-shadcn';
import clsx from 'clsx';
import type { GridIconSlotsComponent } from '../models';
import type { GridBaseSlots } from '../models/gridSlotsComponent';
import {
  GridAddIcon,
  GridCheckIcon,
  GridClearIcon,
  GridCloseIcon,
  GridColumnIcon,
  GridDeleteForeverIcon,
  GridDragIcon,
  GridExpandMoreIcon,
  GridFilterAltIcon,
  GridFilterListIcon,
  GridKeyboardArrowRight,
  GridLoadIcon,
  GridMoreVertIcon,
  GridSaveAltIcon,
  GridSearchIcon,
  GridTableRowsIcon,
  GridViewHeadlineIcon,
  GridViewStreamIcon,
} from './icons';
import { GridColumnUnsortedIcon } from './icons/GridColumnUnsortedIcon';

const iconSlots: GridIconSlotsComponent = {
  booleanCellTrueIcon: GridCheckIcon,
  booleanCellFalseIcon: GridCloseIcon,
  openFilterButtonIcon: GridFilterListIcon,
  filterPanelDeleteIcon: GridCloseIcon,
  columnFilteredIcon: GridFilterAltIcon,
  columnSelectorIcon: GridColumnIcon,
  columnUnsortedIcon: GridColumnUnsortedIcon,
  densityCompactIcon: GridViewHeadlineIcon,
  densityStandardIcon: GridTableRowsIcon,
  densityComfortableIcon: GridViewStreamIcon,
  exportIcon: GridSaveAltIcon,
  moreActionsIcon: GridMoreVertIcon,
  treeDataCollapseIcon: GridExpandMoreIcon,
  treeDataExpandIcon: GridKeyboardArrowRight,
  rowReorderIcon: GridDragIcon,
  quickFilterIcon: GridSearchIcon,
  quickFilterClearIcon: GridCloseIcon,
  columnMenuClearIcon: GridClearIcon,
  loadIcon: GridLoadIcon,
  filterPanelAddIcon: GridAddIcon,
  filterPanelRemoveAllIcon: GridDeleteForeverIcon,
  columnReorderIcon: GridDragIcon,
  menuItemCheckIcon: GridCheckIcon,
  // shadcn
  columnsIcon: icons.column,
  pinIcon: icons.pin,
  hideIcon: icons.hide,
  reorderIcon: icons.reorder,
  columnSortedAscendingIcon: icons.sortAsc,
  columnSortedDescendingIcon: icons.sortDesc,
  columnMenuSortAscendingIcon: icons.sortAsc,
  columnMenuSortDescendingIcon: icons.sortDesc,
  columnMenuIcon: icons.columnMenu,
  columnMenuFilterIcon: icons.filter,
  columnMenuHideIcon: icons.hide,
  columnMenuManageColumnsIcon: icons.column,
  autosizeIcon: icons.autoSize,
  groupingCriteriaExpandIcon: icons.arrowRight,
  groupingCriteriaCollapseIcon: icons.arrowDown,
  detailPanelExpandIcon: icons.plus,
  groupIcon: icons.groupIcon,
  ungroupIcon: icons.ungroup,
  groupExpandIcon: icons.groupExpand,
  aggregationIcon: icons.aggregation,
  dragHandleIcon: icons.dragHandle,
};

const Missing = () => null;
const baseSlots: GridBaseSlots = {
  baseBadge: (props: React.HTMLAttributes<HTMLSpanElement>) => (
    <span
      {...props}
      className={clsx(
        'badge bg-grid-hover-bg px-[4px] h-[20px] inline-flex items-center justify-center rounded-md leading-none text-[0.7rem] min-w-[20px] text-center border border-grid-border text-grid-text/50 dark:text-grid-text/60 tabular-nums font-normal',
        'flex-shrink-0',
        props.className,
      )}
    />
  ),
  baseCheckbox: Checkbox,
  baseCircularProgress: Missing,
  baseDivider: Missing,
  baseLinearProgress: Missing,
  baseDropdownMenu: DropdownMenu,
  baseMenuItem: Missing,
  baseTextField: Input,
  baseFormControl: Missing,
  baseSelect: Missing,
  baseButton: Button,
  baseIconButton: (props) => <Button size="icon" {...props} />,
  baseInputAdornment: Missing,
  baseTooltip: Tooltip,
  basePopper: Popover,
  baseInputLabel: Label,
  baseSelectOption: Missing,
  baseSkeleton: (props) => (
    <div
      className={clsx('bg-black/8 dark:bg-white/8 animate-pulse rounded-md text-[10px]')}
      style={{
        width: props.width,
        height: props.height,
      }}
      data-variant={props.variant}
    />
  ),
  baseChip: Missing,
  baseContextMenu: ContextMenu,
};

const slots: GridBaseSlots & GridIconSlotsComponent = {
  ...baseSlots,
  ...iconSlots,
};

export default slots;
