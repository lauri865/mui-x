import pageTree from '@/content/docs/page-tree';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={pageTree} nav={{ title: 'Example Docs' }}>
      {children}
    </DocsLayout>
  );
}
