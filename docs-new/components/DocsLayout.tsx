import { NavProvider, Title } from 'fumadocs-ui/components/layout/nav';
import { RootToggle } from 'fumadocs-ui/components/layout/root-toggle';
import { LargeSearchToggle, SearchToggle } from 'fumadocs-ui/components/layout/search-toggle';
import { ThemeToggle } from 'fumadocs-ui/components/layout/theme-toggle';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { DocsLayoutProps, LinkItemType } from 'fumadocs-ui/layouts/docs';
import { Navbar, NavbarSidebarTrigger } from 'fumadocs-ui/layouts/docs.client';
import {
  checkPageTree,
  getSidebarTabsFromOptions,
  layoutVariables,
  SidebarLinkItem,
} from 'fumadocs-ui/layouts/docs/shared';
import {
  CollapsibleSidebar,
  Sidebar,
  SidebarCollapseTrigger,
  SidebarFooter,
  SidebarHeader,
  SidebarViewport,
} from 'fumadocs-ui/layouts/docs/sidebar';
import { BaseLinkItem } from 'fumadocs-ui/layouts/links';
import { getLinks, replaceOrDefault } from 'fumadocs-ui/layouts/shared';
import { StylesProvider, TreeContextProvider, type PageStyles } from 'fumadocs-ui/provider';
import { ChevronRight } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { SidebarPageTree } from './PageTree';

export function DocsLayout({
  nav: { enabled: navEnabled = true, component: navReplace, transparentMode, ...nav } = {},
  sidebar: {
    enabled: sidebarEnabled = true,
    collapsible = true,
    component: sidebarReplace,
    tabs: tabOptions,
    banner: sidebarBanner,
    footer: sidebarFooter,
    components: sidebarComponents,
    hideSearch: sidebarHideSearch,
    ...sidebar
  } = {},
  i18n = false,
  ...props
}: DocsLayoutProps): ReactNode {
  checkPageTree(props.tree);
  const links = getLinks(props.links ?? [], props.githubUrl);
  const Aside = collapsible ? CollapsibleSidebar : Sidebar;

  const tabs = getSidebarTabsFromOptions(tabOptions, props.tree) ?? [];
  const variables = cn(
    '[--fd-tocnav-height:36px] md:[--fd-sidebar-width:268px] lg:[--fd-sidebar-width:286px] xl:[--fd-toc-width:286px] xl:[--fd-tocnav-height:0px]',
    !navReplace && navEnabled
      ? '[--fd-nav-height:calc(var(--spacing)*14)] md:[--fd-nav-height:0px]'
      : undefined,
  );

  const pageStyles: PageStyles = {
    tocNav: cn('xl:hidden'),
    toc: cn('max-xl:hidden'),
  };

  return (
    <TreeContextProvider tree={props.tree}>
      <NavProvider transparentMode={transparentMode}>
        {replaceOrDefault(
          { enabled: navEnabled, component: navReplace },
          <Navbar className="md:hidden">
            <Title url={nav.url} title={nav.title} />
            <div className="flex flex-1 flex-row items-center gap-1">{nav.children}</div>
            <SearchToggle hideIfDisabled />
            <NavbarSidebarTrigger className="-me-2 md:hidden" />
          </Navbar>,
          nav,
        )}
        <main
          id="nd-docs-layout"
          {...props.containerProps}
          className={cn(
            'flex flex-1 flex-row pe-(--fd-layout-offset)',
            variables,
            props.containerProps?.className,
          )}
          style={{
            ...layoutVariables,
            ...props.containerProps?.style,
          }}
        >
          {collapsible ? (
            <SidebarCollapseTrigger
              className={cn(
                buttonVariants({
                  color: 'secondary',
                  size: 'icon',
                }),
                'fixed top-1/2 -translate-y-1/2 start-0 z-40 text-fd-muted-foreground border-s-0 rounded-s-none shadow-md data-[collapsed=false]:hidden max-md:hidden',
              )}
            >
              <ChevronRight />
            </SidebarCollapseTrigger>
          ) : null}
          {replaceOrDefault(
            { enabled: sidebarEnabled, component: sidebarReplace },
            <Aside {...sidebar} className={cn('md:ps-(--fd-layout-offset)', sidebar.className)}>
              <SidebarHeader>
                <div className="flex flex-row pt-1 max-md:hidden relative">
                  {nav.children}
                  {collapsible && (
                    <SidebarCollapseTrigger
                      className={cn(
                        buttonVariants({
                          color: 'ghost',
                          size: 'icon-sm',
                        }),
                        'absolute right-0 top-3.5 z-10 ms-auto mb-auto text-fd-muted-foreground max-md:hidden',
                      )}
                    />
                  )}
                </div>
                {sidebarBanner}
                {tabs.length > 0 ? <RootToggle options={tabs} className="-mx-2" /> : null}
                {!sidebarHideSearch ? (
                  <LargeSearchToggle hideIfDisabled className="rounded-lg max-md:hidden" />
                ) : null}
              </SidebarHeader>
              <SidebarViewport>
                <div className="mb-4 empty:hidden md:hidden">
                  {links
                    .filter((v) => v.type !== 'icon')
                    .map((item, i) => (
                      <SidebarLinkItem key={i} item={item} />
                    ))}
                </div>
                <SidebarPageTree components={sidebarComponents} />
              </SidebarViewport>
              <SidebarFooter>
                <SidebarFooterItems
                  links={links}
                  i18n={i18n}
                  disableThemeSwitch={props.disableThemeSwitch ?? false}
                />
                {sidebarFooter}
              </SidebarFooter>
            </Aside>,
            {
              ...sidebar,
              tabs,
            },
          )}
          <StylesProvider {...pageStyles}>{props.children}</StylesProvider>
        </main>
      </NavProvider>
    </TreeContextProvider>
  );
}

function SidebarFooterItems({
  i18n,
  disableThemeSwitch,
  links,
}: {
  i18n: boolean;
  links: LinkItemType[];
  disableThemeSwitch: boolean;
}) {
  const iconItems = links.filter((v) => v.type === 'icon');

  // empty footer items
  if (links.length === 0 && !i18n && disableThemeSwitch) return null;

  return (
    <div className="flex flex-row items-center">
      {iconItems.map((item, i) => (
        <BaseLinkItem
          key={i}
          item={item}
          className={cn(
            buttonVariants({ size: 'icon', color: 'ghost' }),
            'text-fd-muted-foreground md:[&_svg]:size-4.5',
          )}
          aria-label={item.label}
        >
          {item.icon}
        </BaseLinkItem>
      ))}
      <div role="separator" className="flex-1" />
      {!disableThemeSwitch ? <ThemeToggle className="p-0" /> : null}
    </div>
  );
}
