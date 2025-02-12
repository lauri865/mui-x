import type { GridLocaleText } from '../models/api/gridLocaleTextApi';

export interface Localization {
  components: {
    twgrid: {
      defaultProps: {
        localeText: Partial<GridLocaleText>;
      };
    };
  };
}

export const getGridLocalization = (gridTranslations: Partial<GridLocaleText>): Localization => ({
  components: {
    twgrid: {
      defaultProps: {
        localeText: {
          ...gridTranslations,
        },
      },
    },
  },
});
