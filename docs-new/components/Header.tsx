'use client';

import { baseOptions } from '@/app/layout.config';
import Link from 'fumadocs-core/link';
import { Title, useNav } from 'fumadocs-ui/components/layout/nav';
import { LargeSearchToggle, SearchToggle } from 'fumadocs-ui/components/layout/search-toggle';
import { ThemeToggle } from 'fumadocs-ui/components/layout/theme-toggle';
import { LinkItemType } from 'fumadocs-ui/layouts/docs';
import { Menu, MenuContent, MenuLinkItem, MenuTrigger } from 'fumadocs-ui/layouts/home/menu';
import {
  NavbarLink,
  NavbarMenu,
  NavbarMenuContent,
  NavbarMenuLink,
  NavbarMenuTrigger,
} from 'fumadocs-ui/layouts/home/navbar';
import { getLinks } from 'fumadocs-ui/layouts/shared';
import 'katex/dist/katex.min.css';
import { ChevronDown } from 'lucide-react';
import React from 'react';
import { cn } from '../lib/cn';

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuViewport,
} from 'fumadocs-ui/components/ui/navigation-menu';

function Navbar({
  collapse = false,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  collapse?: boolean;
}) {
  const [value, setValue] = React.useState('');
  const { isTransparent } = useNav();

  return (
    <NavigationMenu value={value} onValueChange={setValue} asChild>
      <header
        id="nd-nav"
        {...props}
        className={cn(
          'fixed z-40 top-0 left-1/2 -translate-x-1/2 box-content max-w-[1100px] border-b border-fd-foreground/10 transition-colors mt-2 w-[calc(100%-1rem)] rounded-2xl border',
          value.length > 0 ? 'shadow-lg' : 'shadow-sm',
          'bg-fd-background/80 backdrop-blur-lg',
          collapse &&
            'max-xl:w-full max-xl:rounded-none max-xl:border-none max-xl:!border-b max-xl:mt-0 max-xl:max-w-full',
          props.className,
        )}
      >
        <NavigationMenuList className="flex w-full flex-row items-center px-4 h-12" asChild>
          <nav>{props.children}</nav>
        </NavigationMenuList>
        <NavigationMenuViewport />
      </header>
    </NavigationMenu>
  );
}

export function Header({ collapse }: { collapse?: boolean }) {
  const enableSearch = true;
  const nav = baseOptions.nav!;
  const finalLinks = getLinks(baseOptions.links);
  const navItems = finalLinks.filter((item) => ['nav', 'all'].includes(item.on ?? 'all'));
  const menuItems = finalLinks.filter((item) => ['menu', 'all'].includes(item.on ?? 'all'));

  return (
    <>
      <div className="top-0 fixed backdrop-blur-sm h-4 inset-x-0" />
      <Navbar collapse={collapse}>
        <Title title={nav.title} url={nav.url} />
        {nav.children}
        <ul className="flex flex-row items-center gap-1 px-6 max-sm:hidden">
          {navItems
            .filter((item) => !isSecondary(item))
            .map((item, i) => (
              <NavbarLinkItem
                key={i}
                item={item}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-400 data-[active=true]:bg-fd-card rounded-lg px-3 h-8 data-[active=true]:text-fd-accent-foreground border data-[active=true]:shadow-xs data-[active=false]:border-transparent text-[13.5px] font-medium"
              />
            ))}
        </ul>
        <div className="flex flex-row items-center justify-end gap-1.5 flex-1">
          {enableSearch ? (
            <>
              <SearchToggle className="lg:hidden" hideIfDisabled />
              <LargeSearchToggle className="w-full max-w-[240px] max-lg:hidden" hideIfDisabled />
            </>
          ) : null}
          <ThemeToggle />
        </div>
        <ul className="flex flex-row items-center">
          {navItems.filter(isSecondary).map((item, i) => (
            <NavbarLinkItem key={i} item={item} className="-me-1.5 max-lg:hidden" />
          ))}
          <Menu className="lg:hidden">
            <MenuTrigger aria-label="Toggle Menu" className="group -me-2" enableHover={true}>
              <ChevronDown className="size-3 transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </MenuTrigger>
            <MenuContent className="sm:flex-row sm:items-center sm:justify-end">
              {menuItems
                .filter((item) => !isSecondary(item))
                .map((item, i) => (
                  <MenuLinkItem key={i} item={item} className="sm:hidden" />
                ))}
              <div className="-ms-1.5 flex flex-row items-center gap-1.5 max-sm:mt-2">
                {menuItems.filter(isSecondary).map((item, i) => (
                  <MenuLinkItem key={i} item={item} className="-me-1.5" />
                ))}
                <div role="separator" className="flex-1" />
                <ThemeToggle />
              </div>
            </MenuContent>
          </Menu>
        </ul>
      </Navbar>
    </>
  );
}

function NavbarLinkItem({ item, ...props }: { item: LinkItemType; className?: string }) {
  if (item.type === 'custom') return item.children;

  if (item.type === 'menu') {
    const children = item.items.map((child, j) => {
      if (child.type === 'custom') return <React.Fragment key={j}>{child.children}</React.Fragment>;

      const { banner, footer, ...rest } = child.menu ?? {};

      return (
        <NavbarMenuLink key={j} href={child.url} {...rest}>
          {banner ??
            (child.icon ? (
              <div className="w-fit rounded-md border bg-fd-muted p-1 [&_svg]:size-4">
                {child.icon}
              </div>
            ) : null)}
          <p className="-mb-1 text-sm font-medium">{child.text}</p>
          {child.description ? (
            <p className="text-[13px] text-fd-muted-foreground">{child.description}</p>
          ) : null}
          {footer}
        </NavbarMenuLink>
      );
    });

    return (
      <NavbarMenu>
        <NavbarMenuTrigger {...props}>
          {item.url ? <Link href={item.url}>{item.text}</Link> : item.text}
        </NavbarMenuTrigger>
        <NavbarMenuContent>{children}</NavbarMenuContent>
      </NavbarMenu>
    );
  }
  return (
    <NavbarLink
      {...props}
      item={{
        ...item,
        active: 'nested-url',
      }}
      variant={item.type}
      aria-label={item.type === 'icon' ? item.label : undefined}
    >
      {item.type === 'icon' ? item.icon : item.text}
    </NavbarLink>
  );
}

function isSecondary(item: LinkItemType): boolean {
  return ('secondary' in item && item.secondary === true) || item.type === 'icon';
}
