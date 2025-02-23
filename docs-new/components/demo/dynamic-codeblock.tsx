'use client';
import * as Base from 'fumadocs-ui/components/codeblock';
import { DynamicCodeBlock as DynamicCodeBlockBase } from 'fumadocs-ui/components/dynamic-codeblock';
import { CheckIcon, CopyIcon } from 'lucide-react';
import * as React from 'react';
import { HTMLAttributes } from 'react';
import Editor from 'react-simple-code-editor';
import { cn } from '../../lib/cn';
import { highlighterConfig } from '../../lib/constants';
import { buttonVariants } from '../ui/button';
import { Tooltip } from '../ui/tooltip';
import { useDemoContext } from './DemoContext';

const style: React.CSSProperties = {
  fontFamily:
    'var(--default-mono-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace)',
  fontSize: 13,
};

export function DynamicCodeBlock({
  lang,
  code,
  wrapper,
}: {
  lang: string;
  code: string;
  wrapper?: HTMLAttributes<HTMLDivElement>;
}) {
  const isFirstChange = React.useRef(true);
  const editorRef: React.ComponentProps<typeof Editor>['ref'] = React.useRef(null);
  const { editedCode, setEditedCode, key } = useDemoContext();
  const onCopy = () => {
    navigator.clipboard.writeText(editedCode ?? code);
  };

  const highlighter = React.useCallback(
    (code: string) => (
      <DynamicCodeBlockBase
        lang={lang}
        code={code}
        options={{
          ...highlighterConfig,
          components: {
            pre: (props) => <Base.Pre {...props} className={cn(props.className, 'p-0')} />,
          },
        }}
      />
    ),
    [lang],
  );

  React.useEffect(() => {
    isFirstChange.current = true;
  }, [key]);

  return (
    <div
      {...wrapper}
      className={cn(
        'group not-prose rounded-b-lg bg-fd-secondary/50 p-4 border text-sm overflow-x-auto',
        wrapper?.className,
      )}
    >
      <CopyButton className="absolute right-2 top-2 z-[2] backdrop-blur-md" onCopy={onCopy} />
      <div className="relative *:w-max *:!pr-4 *:min-w-full">
        <Editor
          ref={editorRef}
          key={key}
          value={editedCode ?? code}
          onKeyDownCapture={(e) => {
            // patch history stack to keep initial selection
            if (isFirstChange.current) {
              isFirstChange.current = false;
              if (e.key.length !== 1) return;
              const textarea = e.target as HTMLTextAreaElement;
              if (!textarea || !editorRef.current?.session.history.stack[0]) return;
              editorRef.current.session.history.stack = [
                {
                  selectionStart: textarea.selectionStart,
                  selectionEnd: textarea.selectionEnd,
                  value: code,
                  timestamp: 0,
                },
              ];

              editorRef.current.session.history.offset = 0;
            }
          }}
          onValueChange={setEditedCode}
          className="*:focus-visible:outline-0 *:selection:bg-fd-primary/20"
          highlight={highlighter}
          style={style}
        />
      </div>
    </div>
  );
}

function useCopyButton(onCopy: () => void): [checked: boolean, onClick: React.MouseEventHandler] {
  const [checked, setChecked] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);
  const callbackRef = React.useRef(onCopy);
  callbackRef.current = onCopy;

  const onClick: React.MouseEventHandler = React.useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setChecked(false);
    }, 1500);
    callbackRef.current();
    setChecked(true);
  }, []);

  // Avoid updates after being unmounted
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return [checked, onClick];
}

function CopyButton({
  className,
  onCopy,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  onCopy: () => void;
}) {
  const [checked, onClick] = useCopyButton(onCopy);

  return (
    <Tooltip title={!checked ? 'Copy' : undefined}>
      <button
        type="button"
        className={cn(
          buttonVariants({
            variant: 'ghost',
            size: 'sm',
          }),
          'size-7.5 p-0',
          'transition-opacity group-hover:opacity-100 [&_svg]:size-3.5',
          !checked && '[@media(hover:hover)]:opacity-0',

          className,
        )}
        aria-label={checked ? 'Copied Text' : 'Copy Text'}
        onClick={onClick}
        {...props}
      >
        <CheckIcon className={cn('transition-transform', !checked && 'scale-0')} />
        <CopyIcon className={cn('absolute transition-transform', checked && 'scale-0')} />
      </button>
    </Tooltip>
  );
}
