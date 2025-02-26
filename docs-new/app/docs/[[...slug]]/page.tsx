import * as Preview from '@/components/preview';
import { Wrapper } from '@/components/preview/wrapper';
import { AutoTypeTable } from '@/components/type-table';
import { createMetadata } from '@/lib/metadata';
import { metadataImage } from '@/lib/metadata-image';
import { source } from '@/lib/source';
import { Mermaid } from '@theguild/remark-mermaid/mermaid';
import { Popup, PopupContent, PopupTrigger } from 'fumadocs-twoslash/ui';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Callout } from 'fumadocs-ui/components/callout';
import { File, Files, Folder } from 'fumadocs-ui/components/files';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import defaultComponents from 'fumadocs-ui/mdx';
import { DocsBody, DocsCategory, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type ComponentProps, type FC, type ReactElement, type ReactNode } from 'react';
import { Demo } from '../../../components/Demo';

function PreviewRenderer({ preview }: { preview: string }): ReactNode {
  if (preview && preview in Preview) {
    const Comp = Preview[preview as keyof typeof Preview];
    return <Comp />;
  }

  return null;
}

export const dynamicParams = false;
export const revalidate = false;

export default async function Page(props: {
  params: Promise<{ slug: string[] }>;
}): Promise<ReactElement> {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) {
    notFound();
  }

  const path = `docs/content/docs/${page.file.path}`;
  const preview = page.data.preview;
  const { body: Mdx, toc, lastModified } = await page.data.load();

  return (
    <DocsPage
      toc={toc}
      lastUpdate={lastModified}
      full={page.data.full}
      tableOfContent={{
        style: 'clerk',
        single: false,
      }}
      editOnGithub={{
        repo: 'react',
        owner: 'twgrid',
        sha: 'main',
        path,
      }}
      article={{
        className: 'max-sm:pb-16',
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody className="text-fd-foreground/80 text-[15px]">
        {preview ? <PreviewRenderer preview={preview} /> : null}
        <Mdx
          components={{
            ...defaultComponents,
            Link,
            Popup,
            PopupContent,
            PopupTrigger,
            Tabs,
            Tab,
            Mermaid,
            TypeTable,
            AutoTypeTable,
            Accordion,
            Accordions,
            Wrapper,
            File,
            Folder,
            Files,
            blockquote: Callout as unknown as FC<ComponentProps<'blockquote'>>,
            DocsCategory: () => <DocsCategory page={page} from={source} />,
            Demo,
            ...(await import('@/content/docs/components/tabs.client')),
          }}
        />
        {page.data.index ? <DocsCategory page={page} from={source} /> : null}
      </DocsBody>
    </DocsPage>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) {
    notFound();
  }

  const description = page.data.description ?? 'The library for building documentation sites';

  return createMetadata(
    metadataImage.withImage(page.slugs, {
      title: page.data.title,
      description,
      openGraph: {
        url: `/docs/${page.slugs.join('/')}`,
      },
    }),
  );
}

export function generateStaticParams(): { slug: string[] }[] {
  return source.generateParams();
}
