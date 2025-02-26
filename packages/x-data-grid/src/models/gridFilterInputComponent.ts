import { RefObject } from '@mui/x-internals/types';
import * as React from 'react';
import type { GridApiCommon } from './api/gridApiCommon';
import type { GridApi } from './api/gridApiCommunity';
import { GridFilterCondition, GridFilterItem } from './gridFilterItem';

export type GridFilterInputSlotProps = {
  size?: 'small' | 'medium';
  label?: React.ReactNode;
  placeholder?: string;
};

export type GridFilterInputValueProps<
  T extends GridFilterInputSlotProps = GridFilterInputSlotProps,
  Api extends GridApiCommon = GridApi,
> = {
  item: GridFilterCondition;
  filter: GridFilterItem;
  applyValue: (value: GridFilterCondition) => void;
  // Is any because if typed as GridApiRef a dep cycle occurs. Same happens if ApiContext is used.
  apiRef: RefObject<Api>;
  inputRef?: React.Ref<HTMLElement | null>;
  focusElementRef?: React.Ref<any>;
  headerFilterMenu?: React.ReactNode;
  clearButton?: React.ReactNode | null;
  /**
   * It is `true` if the filter either has a value or an operator with no value
   * required is selected (for example `isEmpty`)
   */
  isFilterActive?: boolean;
  onFocus?: React.FocusEventHandler;
  onBlur?: React.FocusEventHandler;

  tabIndex?: number;
  disabled?: boolean;
  className?: string;

  slotProps?: {
    root: T;
  };
};
