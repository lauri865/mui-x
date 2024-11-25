import { GridPinnedColumnPosition } from '../hooks/features/columns/gridColumnsInterfaces';

export const shouldCellShowRightBorder = (
  pinnedPosition: GridPinnedColumnPosition | undefined,
  indexInSection: number,
  isLastVisibleInSection: boolean,
  showCellVerticalBorderRootProp: boolean,
  gridHasFiller: boolean,
) => {
  if (pinnedPosition === GridPinnedColumnPosition.LEFT && isLastVisibleInSection) {
    return true;
  }
  if (showCellVerticalBorderRootProp) {
    if (pinnedPosition === GridPinnedColumnPosition.LEFT) {
      return true;
    }
    if (pinnedPosition === GridPinnedColumnPosition.RIGHT) {
      return !isLastVisibleInSection;
    }
    // pinnedPosition === undefined, middle section
    return !isLastVisibleInSection || gridHasFiller;
  }
  return false;
};

export const shouldCellShowLeftBorder = (
  pinnedPosition: GridPinnedColumnPosition | undefined,
  indexInSection: number,
) => {
  return pinnedPosition === GridPinnedColumnPosition.RIGHT && indexInSection === 0;
};
