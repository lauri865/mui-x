export const GridRowStickyPosition = {
  pinnedTop: -2,
  top: -1,
  none: 0,
  bottom: 1,
  pinnedBottom: 2,
} as const;

export type GridRowStickyPosition =
  (typeof GridRowStickyPosition)[keyof typeof GridRowStickyPosition];
