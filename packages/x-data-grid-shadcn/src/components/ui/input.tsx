import * as React from 'react';

import { cn } from '../../lib/utils';

export interface InputProps extends React.ComponentProps<'input'> {
  left?: React.ReactNode;
  right?: React.ReactNode;
  variant?: 'default' | 'ghost';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, left, right, variant = 'default', ...props }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    return (
      <div
        className={cn(
          'flex-row min-w-0 gap-1.5 flex h-9 w-full items-center px-3 bg-transparent transition-colors disabled:opacity-50 cursor-text',
          className,
          variant !== 'ghost' &&
            'rounded-md border border-input shadow-xs focus-within:outline-1 focus-within:ring-4 focus-within:ring-ring/10 outline-ring/50',
        )}
        ref={containerRef}
        onPointerDown={(e) => {
          e.preventDefault();
          containerRef.current?.querySelector('input')?.focus();
        }}
      >
        {left && (
          <div className="flex -ml-1 h-full items-center text-muted-foreground pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_button]:pointer-events-auto [&_a]:pointer-events-auto">
            {left}
          </div>
        )}
        <div className="relative flex-1 w-full flex h-full min-w-[80px]">
          <input
            ref={ref}
            className={cn(
              'absolute inset-0 flex h-full w-full flex-1 min-w-0 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            )}
            type={type}
            {...props}
          />
        </div>
        {right && (
          <div className="h-full -mr-1 flex items-center text-muted-foreground pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_button]:pointer-events-auto [&_a]:pointer-events-auto">
            {right}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
