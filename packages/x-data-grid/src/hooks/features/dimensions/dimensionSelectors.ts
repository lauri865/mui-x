import { GridState } from '../../../models/gridStateCommunity';

export const gridRowHeightSelector = (state: GridState) => state.dimensions.rowHeight;

export const gridDimensionsColumnsTotalWidthSelector = (state: GridState) =>
  state.dimensions.columnsTotalWidth;

export const gridContentHeightSelector = (state: GridState) => state.dimensions.contentSize.height;

export const gridHasScrollXSelector = (state: GridState) => state.dimensions.hasScrollX;

export const gridHasScrollYSelector = (state: GridState) => state.dimensions.hasScrollY;

export const gridHasFillerSelector = (state: GridState) =>
  state.dimensions.columnsTotalWidth < state.dimensions.viewportOuterSize.width;

export const gridHeaderHeightSelector = (state: GridState) => state.dimensions.headerHeight;

export const gridGroupHeaderHeightSelector = (state: GridState) =>
  state.dimensions.groupHeaderHeight;

export const gridHeaderFilterHeightSelector = (state: GridState) =>
  state.dimensions.headerFilterHeight;

export const gridVerticalScrollbarWidthSelector = (state: GridState) =>
  state.dimensions.hasScrollY ? state.dimensions.scrollbarSize : 0;

export const gridHorizontalScrollbarHeightSelector = (state: GridState) =>
  state.dimensions.hasScrollX ? state.dimensions.scrollbarSize : 0;

export const gridHasBottomFillerSelector = (state: GridState) => {
  const height = state.dimensions.hasScrollX ? state.dimensions.scrollbarSize : 0;
  const needsLastRowBorder =
    state.dimensions.viewportOuterSize.height - state.dimensions.minimumSize.height > 0;

  if (height === 0 && !needsLastRowBorder) {
    return false;
  }

  return true;
};
