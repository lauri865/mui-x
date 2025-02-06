import * as React from 'react';
import MUIBadge from '@mui/material/Badge';
import MUIChip from '@mui/material/Chip';
import MUICircularProgress from '@mui/material/CircularProgress';
import MUIDivider from '@mui/material/Divider';
import MUILinearProgress from '@mui/material/LinearProgress';
import MUIListItemIcon from '@mui/material/ListItemIcon';
import MUIListItemText from '@mui/material/ListItemText';
import MUIMenuItem from '@mui/material/MenuItem';
import MUITextField from '@mui/material/TextField';
import MUIFormControl from '@mui/material/FormControl';
import MUISelect from '@mui/material/Select';
import MUIInputAdornment from '@mui/material/InputAdornment';
import MUIPopper from '@mui/material/Popper';
import MUIInputLabel from '@mui/material/InputLabel';
import MUISkeleton from '@mui/material/Skeleton';
import { Button, Checkbox, DropdownMenu, icons, Tooltip } from '@twgrid/x-data-grid-shadcn';
import { GridColumnUnsortedIcon } from './icons/GridColumnUnsortedIcon';
import {
  GridAddIcon,
  GridCheckIcon,
  GridCloseIcon,
  GridColumnIcon,
  GridDragIcon,
  GridExpandMoreIcon,
  GridFilterAltIcon,
  GridFilterListIcon,
  GridKeyboardArrowRight,
  GridMoreVertIcon,
  GridRemoveIcon,
  GridSaveAltIcon,
  GridSearchIcon,
  GridTableRowsIcon,
  GridViewHeadlineIcon,
  GridViewStreamIcon,
  GridClearIcon,
  GridLoadIcon,
  GridDeleteForeverIcon,
} from './icons';
import type { GridIconSlotsComponent } from '../models';
import type { GridBaseSlots } from '../models/gridSlotsComponent';
import type { GridSlotProps } from '../models/gridSlotsComponentsProps';
import MUISelectOption from './components/MUISelectOption';

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
  detailPanelExpandIcon: GridAddIcon,
  detailPanelCollapseIcon: GridRemoveIcon,
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
};

const baseSlots: GridBaseSlots = {
  baseBadge: MUIBadge,
  baseCheckbox: Checkbox,
  baseCircularProgress: MUICircularProgress,
  baseDivider: MUIDivider,
  baseLinearProgress: MUILinearProgress,
  baseDropdownMenu: DropdownMenu,
  baseMenuItem: BaseMenuItem,
  baseTextField: BaseTextField,
  baseFormControl: MUIFormControl,
  baseSelect: MUISelect,
  baseButton: Button,
  baseIconButton: (props) => <Button size="icon" {...props} />,
  baseInputAdornment: MUIInputAdornment,
  baseTooltip: Tooltip,
  basePopper: MUIPopper,
  baseInputLabel: MUIInputLabel,
  baseSelectOption: MUISelectOption,
  baseSkeleton: MUISkeleton,
  baseChip: MUIChip,
};

const materialSlots: GridBaseSlots & GridIconSlotsComponent = {
  ...baseSlots,
  ...iconSlots,
};

export default materialSlots;

function BaseMenuItem(props: GridSlotProps['baseMenuItem']) {
  const { inert, iconStart, iconEnd, children, ...other } = props;
  if (inert) {
    (other as any).disableRipple = true;
  }
  return React.createElement(MUIMenuItem, other, [
    iconStart && <MUIListItemIcon key="1">{iconStart}</MUIListItemIcon>,
    <MUIListItemText key="2">{children}</MUIListItemText>,
    iconEnd && <MUIListItemIcon key="3">{iconEnd}</MUIListItemIcon>,
  ]);
}

function BaseTextField(props: GridSlotProps['baseTextField']) {
  // MaterialUI v5 doesn't support slotProps, until we drop v5 support we need to
  // translate the pattern.
  const { slotProps, ...rest } = props;
  return (
    <MUITextField
      variant="outlined"
      {...rest}
      inputProps={slotProps?.htmlInput}
      InputProps={slotProps?.input}
      InputLabelProps={{
        shrink: true,
        ...(slotProps as any)?.inputLabel,
      }}
    />
  );
}
