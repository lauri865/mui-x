import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/source';
import { type DocsLayoutProps } from 'fumadocs-ui/layouts/docs';
import 'katex/dist/katex.min.css';
import type { ReactNode } from 'react';
import { DocsLayout } from '../../components/DocsLayout';
import { GithubStarsButton } from '../../components/GithubStarButton';
import { Header } from '../../components/Header';

const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  containerProps: {
    className:
      '[--fd-banner-height:48px] xl:[--fd-banner-height:58px] [--fd-sidebar-width:240px!important] ![--fd-toc-width:200px] [&_article]:pt-18 [&_article]:max-w-[900px]',
  },
  nav: {
    enabled: false,
  },
  tree: source.pageTree,
  /*   links: [linkItems[linkItems.length - 1]], */
  links: [],
  sidebar: {
    prefetch: false,
    footer: (
      <div className="relative">
        <div className="absolute left-0 -bottom-0.5">
          <GithubStarsButton />
        </div>
      </div>
    ),
    className:
      '[&>div]:pt-0 [&>div]:border-t xl:[&>div]:rounded-tr-md bg-transparent *:bg-fd-card xl:pt-[20px]',
    hideSearch: true,
    tabs: {
      transform(option, node) {
        const meta = source.getNodeMeta(node);
        if (!meta) {
          return option;
        }

        const color = `var(--${meta.file.dirname}-color, var(--color-fd-foreground))`;

        return {
          ...option,
          icon: (
            <div
              className="rounded-md p-1 shadow-lg ring-2 [&_svg]:size-5"
              style={
                {
                  color,
                  border: `1px solid color-mix(in oklab, ${color} 50%, transparent)`,
                  '--tw-ring-color': `color-mix(in oklab, ${color} 20%, transparent)`,
                } as object
              }
            >
              {node.icon}
            </div>
          ),
        };
      },
    },
  },
};

export default async function Layout({
  children,
}: {
  children: ReactNode;
  params: { slug: string[] };
}) {
  return (
    <>
      <Header collapse />
      <div className="h-[48px]" />
      <DocsLayout {...docsOptions}>{children}</DocsLayout>
    </>
  );
}
