import { GridDensity } from '../../../models/gridDensity';
import { GridState } from '../../../models/gridStateCommunity';
import { createSelector } from '../../../utils/createSelector';

export const COMPACT_DENSITY_FACTOR = 0.7;
export const COMFORTABLE_DENSITY_FACTOR = 1.3;

const DENSITY_FACTORS: Record<GridDensity, number> = {
  compact: COMPACT_DENSITY_FACTOR,
  comfortable: COMFORTABLE_DENSITY_FACTOR,
  standard: 1,
};

export const gridDensitySelector = (state: GridState) => state.density;

export const gridDensityFactorSelector = createSelector(
  gridDensitySelector,
  (density) => DENSITY_FACTORS[density],
);
