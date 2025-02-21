'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as React from 'react';

import { cn } from '../../lib/utils';
import { useTwgPortal } from './useTwgPortal';

const Root = PopoverPrimitive.Root;

const Trigger = PopoverPrimitive.Trigger;

const Anchor = PopoverPrimitive.Anchor;

const Content = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal container={useTwgPortal()}>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-10 w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-98 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 !duration-150',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
Content.displayName = PopoverPrimitive.Content.displayName;

export { Anchor, Content, Root, Trigger };
