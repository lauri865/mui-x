import { cn } from '@/lib/cn';
import type { HTMLAttributes } from 'react';

export function Wrapper(props: HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div
      {...props}
      className={cn(
        'rounded-lg bg-gradient-to-br from-pink-500/20 to-blue-500/20 p-4 prose-no-margin [&_.twg-root]:shadow-sm',
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}
