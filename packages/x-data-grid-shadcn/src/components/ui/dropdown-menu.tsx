import * as Primitive from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/utils';

const Root = Primitive.Root;

const Trigger = Primitive.Trigger;

const Group = Primitive.Group;

const Portal = (props: React.ComponentPropsWithoutRef<typeof Primitive.Portal>) => (
  <Primitive.Portal container={document.getElementById('twg-portal') || document.body} {...props} />
);

const Sub = Primitive.Sub;

const RadioGroup = Primitive.RadioGroup;

const SubTrigger = React.forwardRef<
  React.ElementRef<typeof Primitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof Primitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <Primitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:text-base [&_svg]:shrink-0',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </Primitive.SubTrigger>
));
SubTrigger.displayName = Primitive.SubTrigger.displayName;

const SubContent = React.forwardRef<
  React.ElementRef<typeof Primitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof Primitive.SubContent>
>(({ className, ...props }, ref) => (
  <Primitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md dark:shadow-black data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className,
    )}
    {...props}
  />
));
SubContent.displayName = Primitive.SubContent.displayName;

const Content = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <Portal>
    <Primitive.Content
      ref={ref}
      sideOffset={sideOffset}
      side="bottom"
      className={cn(
        'z-5000 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md dark:shadow-black',
        'data-[state=open]:animate-in duration-150 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=open]:data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </Portal>
));
Content.displayName = Primitive.Content.displayName;

const Item = React.forwardRef<
  React.ElementRef<typeof Primitive.Item>,
  React.ComponentPropsWithoutRef<typeof Primitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <Primitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-3.5 [&_svg]:!text-[15px] [&>svg]:shrink-0',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
Item.displayName = Primitive.Item.displayName;

const CheckboxItem = React.forwardRef<
  React.ElementRef<typeof Primitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof Primitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <Primitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Primitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </Primitive.ItemIndicator>
    </span>
    {children}
  </Primitive.CheckboxItem>
));
CheckboxItem.displayName = Primitive.CheckboxItem.displayName;

const RadioItem = React.forwardRef<
  React.ElementRef<typeof Primitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof Primitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <Primitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:!text-base [&>svg:last-child]:ml-auto',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Primitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </Primitive.ItemIndicator>
    </span>
    {children}
  </Primitive.RadioItem>
));
RadioItem.displayName = Primitive.RadioItem.displayName;

const Label = React.forwardRef<
  React.ElementRef<typeof Primitive.Label>,
  React.ComponentPropsWithoutRef<typeof Primitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <Primitive.Label
    ref={ref}
    className={cn(
      'flex px-2 py-1.5 text-sm font-medium flex gap-2 [&_svg]:size-4 items-center',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
Label.displayName = Primitive.Label.displayName;

const Separator = React.forwardRef<
  React.ElementRef<typeof Primitive.Separator>,
  React.ComponentPropsWithoutRef<typeof Primitive.Separator>
>(({ className, ...props }, ref) => (
  <Primitive.Separator ref={ref} className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
));
Separator.displayName = Primitive.Separator.displayName;

function Shortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />
  );
}
Shortcut.displayName = 'Shortcut';

export {
  CheckboxItem,
  Content,
  Group,
  Item,
  Label,
  Portal,
  RadioGroup,
  RadioItem,
  Root,
  Separator,
  Shortcut,
  Sub,
  SubContent,
  SubTrigger,
  Trigger,
};
