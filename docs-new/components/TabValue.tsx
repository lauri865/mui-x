export const TAB = {
  TS: 'ts',
  JS: 'js',
} as const;
export type TabValue = (typeof TAB)[keyof typeof TAB];
