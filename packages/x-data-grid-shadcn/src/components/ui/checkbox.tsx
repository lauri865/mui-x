import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check, Minus } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/utils';

const Checkbox = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    indeterminate?: boolean;
  }
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'group peer border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 size-4 shrink-0 rounded-[4px] border shadow transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:focus-visible:ring-0',
      'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:border-primary',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
      <Check className="size-2.5 stroke-4 group-data-[state=indeterminate]:hidden" />
      <Minus className="size-2.5 stroke-4 hidden group-data-[state=indeterminate]:flex" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
