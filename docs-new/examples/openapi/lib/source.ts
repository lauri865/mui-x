import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';
import { APIPlayground } from 'fumadocs-openapi/scalar';
import { attachFile, createOpenAPI } from 'fumadocs-openapi/server';
import { docs, meta } from '@/.source';

export const source = loader({
  baseUrl: '/docs',
  source: createMDXSource(docs, meta),
  pageTree: {
    attachFile,
  },
});

export const openapi = createOpenAPI({
  renderer: {
    APIPlayground,
  },
});
