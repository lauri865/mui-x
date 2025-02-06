import * as React from 'react';
import clsx from 'clsx';
import { theme } from '../theme';

type GridTheme = typeof theme;
export const GridThemeContext = React.createContext<GridTheme>({} as GridTheme);
export const useTheme = () => React.useContext(GridThemeContext);

type ThemedComponent = keyof GridTheme;

export const useThemedComponent = <N extends keyof GridTheme>(
  name: N,
  variants?: GridTheme[N] extends Record<string, any>
    ? Partial<Record<keyof GridTheme[N], boolean>>
    : never,
) => {
  const theme = useTheme();
  return {
    root: clsx(
      `twg-${name}`,
      typeof theme[name] === 'string'
        ? theme[name]
        : 'base' in theme[name]
          ? theme[name].base
          : (undefined as any),
      variants &&
        Object.entries(variants).map(([key, value]) =>
          value && theme[name][key as keyof GridTheme[N]]
            ? `twg-${name}-${key} ${  theme[name][key as keyof GridTheme[N]]}`
            : '',
        ),
    ),
    variants: theme[name],
  };
};
