'use client';

import { cn } from '@/lib/cn';
import { cva } from 'class-variance-authority';
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover';
import { ExternalLinkIcon, InfoIcon } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function Info({ children }: { children: ReactNode }): ReactNode {
  return (
    <Popover>
      <PopoverTrigger className="group">
        <InfoIcon className="size-4 rounded-full group-data-[state=open]:[&_circle]:stroke-fd-primary ring-fd-primary group-data-[state=open]:text-fd-primary" />
      </PopoverTrigger>
      <PopoverContent className="prose max-h-[400px] min-w-[220px] max-w-[400px] overflow-auto text-sm prose-no-margin">
        <pre className="whitespace-pre-wrap py-0 text-[12px] **:my-0 [&_code]:text-[12px] [&_li]:leading-[1.3] flex flex-col gap-y-2 [&_hr]:mt-0 [&_hr]:-mx-2">
          {children}
        </pre>
      </PopoverContent>
    </Popover>
  );
}

interface ObjectType {
  /**
   * Additional description of the field
   */
  description?: ReactNode;
  type: ReactNode;
  typeDescription?: ReactNode;
  required?: boolean;
  /**
   * Optional link to the type
   */
  typeDescriptionLink?: string;
  default?: string;
}

const field = cva('inline-flex flex-row items-center gap-1');
const code = cva(
  'rounded-md bg-fd-secondary px-1 py-0 text-fd-secondary-foreground text-[12px] *:bg-transparent',
  {
    variants: {
      color: {
        primary: 'bg-fd-primary/10 text-fd-primary',
        required: 'bg-emerald-500/10 text-emerald-600',
      },
    },
  },
);

export function TypeTable({
  type,
  showRequired,
  hideDefault,
}: {
  type: Record<string, ObjectType>;
  showRequired?: boolean;
  hideDefault?: boolean;
}) {
  return (
    <div className="prose my-6 overflow-auto prose-no-margin">
      <table className="whitespace-pre-wrap text-[12px] text-fd-muted-foreground table-auto">
        <thead>
          <tr className="*:py-1.5">
            <th className="w-[30%]">Prop</th>
            <th>Type</th>
            {!hideDefault && <th>Default</th>}
          </tr>
        </thead>
        <tbody>
          {Object.entries(type).map(([key, value]) => (
            <tr key={key}>
              <td>
                <div className={field()}>
                  <code className={cn(code({ color: value.required ? 'required' : 'primary' }))}>
                    {key}
                    {value.required ? '' : '?'}
                  </code>
                  {value.description ? (
                    <Info>
                      {value.required && showRequired ? (
                        <div className="font-medium text-fd-foreground -mb-2"> * Required</div>
                      ) : null}

                      {value.description}
                    </Info>
                  ) : null}
                </div>
              </td>
              <td>
                <div className={field()}>
                  <code
                    className={code({
                      className: '*:!whitespace-pre-wrap',
                    })}
                  >
                    {value.type}
                  </code>
                  {value.typeDescription ? <Info>{value.typeDescription}</Info> : null}
                  {value.typeDescriptionLink ? (
                    <Link href={value.typeDescriptionLink} target="_blank">
                      <ExternalLinkIcon className="size-4 opacity-50" />
                    </Link>
                  ) : null}
                </div>
              </td>
              {!hideDefault && (
                <td className="whitespace-nowrap">
                  {value.default ? <code className={code()}>{value.default}</code> : <span>-</span>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
