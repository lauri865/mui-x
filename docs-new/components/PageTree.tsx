'use client';
import { cn } from '@/lib/cn';
import type { PageTree } from 'fumadocs-core/server';
import { CollapsibleContent } from 'fumadocs-ui/components/ui/collapsible';
import type { SidebarComponents } from 'fumadocs-ui/layouts/docs/shared';
import {
  SidebarFolder,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
  SidebarSeparator,
} from 'fumadocs-ui/layouts/docs/sidebar';
import { useTreeContext, useTreePath } from 'fumadocs-ui/provider';
import React, { type HTMLAttributes, type ReactNode, useMemo } from 'react';

export function SidebarPageTree(props: { components?: Partial<SidebarComponents> }) {
  const { root } = useTreeContext();

  return useMemo(() => {
    const { Separator, Item, Folder } = props.components ?? {};

    function renderSidebarList(items: PageTree.Node[], level: number): ReactNode[] {
      return items.map((item, i) => {
        const id = `${item.type}_${i}`;

        if (item.type === 'separator') {
          if (Separator) return <Separator key={id} item={item} />;
          return (
            <SidebarSeparator key={id} className={cn(i !== 0 && 'mt-8')}>
              {item.icon}
              {item.name}
            </SidebarSeparator>
          );
        }

        if (item.type === 'folder') {
          const children = renderSidebarList(item.children, level + 1);

          if (Folder)
            return (
              <Folder key={id} item={item} level={level}>
                {children}
              </Folder>
            );
          return (
            <PageTreeFolder key={id} item={item}>
              {children}
            </PageTreeFolder>
          );
        }

        if (Item) return <Item key={item.url} item={item} />;
        return (
          <SidebarItem key={item.url} href={item.url} external={item.external} icon={item.icon}>
            {item.name}
          </SidebarItem>
        );
      });
    }

    return renderSidebarList(root.children, 1);
  }, [root, props.components]);
}

function PageTreeFolder({
  item,
  ...props
}: HTMLAttributes<HTMLElement> & {
  item: PageTree.Folder;
}) {
  const path = useTreePath();
  const defaultOpen = item.defaultOpen || path.includes(item);
  return (
    <SidebarFolder defaultOpen={defaultOpen}>
      {item.index ? (
        <SidebarFolderLink href={item.index.url} external={item.index.external} {...props}>
          {item.icon}
          {item.name}
        </SidebarFolderLink>
      ) : (
        <SidebarFolderTrigger {...props}>
          {item.icon}
          {item.name}
        </SidebarFolderTrigger>
      )}
      <SidebarFolderContent defaultOpen={defaultOpen}>{props.children}</SidebarFolderContent>
    </SidebarFolder>
  );
}

export function SidebarFolderContent({ defaultOpen, ...props }: any) {
  const [isAnimationPrevented, setIsAnimationPrevented] = React.useState(defaultOpen);
  React.useEffect(() => {
    setIsAnimationPrevented(false);
  }, []);
  return (
    <CollapsibleContent
      {...props}
      className={cn('relative', props.className, isAnimationPrevented && '!animate-none')}
    >
      <div className="absolute w-px inset-y-0 bg-fd-border start-3" />
      {props.children}
    </CollapsibleContent>
  );
}
