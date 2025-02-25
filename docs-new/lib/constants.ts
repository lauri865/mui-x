import type { RehypeShikiOptions } from '@shikijs/rehype';

export const highlighterConfig: RehypeShikiOptions = {
  themes: {
    light: 'github-light',
    dark: 'github-dark-default',
  },
  colorReplacements: {
    'github-light': {
      '#032f62': 'var(--color-blue-600)',
    },
    'github-dark-default': {
      '#a5d6ff': 'var(--color-teal-400)',
    },
  },
};
