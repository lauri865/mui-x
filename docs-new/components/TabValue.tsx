export const TAB = {
  TS: 'tsx',
  JS: 'jsx',
} as const;
export type TabValue = (typeof TAB)[keyof typeof TAB];
