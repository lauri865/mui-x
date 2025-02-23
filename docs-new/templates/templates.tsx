import { TAB } from '../components/TabValue';

export const templates = {
  codesandbox: {
    [TAB.TS]: 'typescript-cra',
    [TAB.JS]: 'js-cra',
  },
  stackblitz: {
    [TAB.TS]: 'typescript-vite-stackblitz',
    [TAB.JS]: 'js-vite-stackblitz',
  },
};
