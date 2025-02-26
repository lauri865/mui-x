import { GridState } from '../../models/gridStateCommunity';

/**
 * Get the theme state
 * @category Core
 */
export const gridIsRtlSelector = (state: GridState) => state.isRtl;
