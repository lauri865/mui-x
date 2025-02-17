import * as React from 'react';

import { cn } from '../../lib/utils';

export interface InputProps extends React.ComponentProps<'input'> {
  left?: React.ReactNode;
  right?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, left, right, ...props }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    return (
      <div
        className={cn(
          'flex-row gap-1.5 flex h-9 w-full items-center px-3 rounded-md border border-input bg-transparent shadow-xs transition-colors focus-within:outline-1 focus-within:ring-4 focus-within:ring-ring/10 disabled:opacity-50 cursor-text outline-ring/50',
          className,
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
        <input
          ref={ref}
          className={cn(
            'h-full w-full flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed',
          )}
          type={type}
          {...props}
        />
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
