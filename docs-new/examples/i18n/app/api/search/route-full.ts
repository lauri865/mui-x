import { i18n } from '@/lib/i18n';
import { source } from '@/lib/source';
import { createI18nSearchAPI } from 'fumadocs-core/search/server';

export const { GET } = createI18nSearchAPI('advanced', {
  i18n,
  indexes: source.getLanguages().flatMap((entry) =>
    entry.pages.map((page) => ({
      title: page.data.title,
      description: page.data.description,
      structuredData: page.data.structuredData,
      id: page.url,
      url: page.url,
      locale: entry.language,
    })),
  ),
});
