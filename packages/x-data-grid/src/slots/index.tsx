import {
  Button,
  Checkbox,
  ContextMenu,
  DropdownMenu,
  icons,
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
  groupingCriteriaCollapseIcon: GridExpandMoreIcon,
  groupingCriteriaExpandIcon: GridKeyboardArrowRight,
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
  detailPanelExpandIcon: icons.arrowRight,
  detailPanelCollapseIcon: icons.arrowDown,
};

const Missing = () => null;
const baseSlots: GridBaseSlots = {
  baseBadge: () => null,
  baseCheckbox: Checkbox,
  baseCircularProgress: Missing,
  baseDivider: Missing,
  baseLinearProgress: Missing,
  baseDropdownMenu: DropdownMenu,
  baseMenuItem: Missing,
  baseTextField: Missing,
  baseFormControl: Missing,
  baseSelect: Missing,
  baseButton: Button,
  baseIconButton: (props) => <Button size="icon" {...props} />,
  baseInputAdornment: Missing,
  baseTooltip: Tooltip,
  basePopper: Missing,
  baseInputLabel: Missing,
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
