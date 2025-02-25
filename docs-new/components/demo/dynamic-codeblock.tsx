'use client';
import { highlight } from 'fumadocs-core/highlight';
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

const codeblockOptions = {
  ...highlighterConfig,
  components: {
    pre: (props: any) => <Base.Pre {...props} className={cn(props.className, 'p-0')} />,
  },
};

export function DynamicCodeBlock({
  lang,
  wrapper,
}: {
  lang: string;
  wrapper?: HTMLAttributes<HTMLDivElement>;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isShikiInitialized = React.useRef(false);
  const {
    editedCode,
    setEditedCode,
    key,
    tabInitialCode,
    isPreview,
    isExpanded,
    preview,
    activeTabRef,
    mergedCode,
  } = useDemoContext();

  const initialCode = isPreview ? (preview[activeTabRef.current]! ?? '') : tabInitialCode;
  const value = editedCode ?? initialCode;
  const numberOfLines = value.split('\n').length ?? 1;

  const isFirstChange = React.useRef(true);
  const editorRef: React.ComponentProps<typeof Editor>['ref'] = React.useRef(null);
  const onCopy = () => {
    navigator.clipboard.writeText(mergedCode);
    const textarea = containerRef.current?.querySelector('textarea');
    if (textarea) {
      textarea.focus();
      textarea.selectionStart = textarea.value.length;
    }
  };

  const highlighter = React.useCallback(
    (code: string) => <DynamicCodeBlockBase lang={lang} code={code} options={codeblockOptions} />,
    [lang],
  );

  React.useEffect(() => {
    isFirstChange.current = true;
  }, [key]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    // patch history stack to keep initial selection
    if (isFirstChange.current) {
      isFirstChange.current = false;
      if (e.key?.length !== 1) return;
      const textarea = e.target as HTMLTextAreaElement;
      if (!textarea || !editorRef.current?.session.history.stack[0]) return;
      const value = editorRef.current.session.history.stack[0].value;
      editorRef.current.session.history.stack = [
        {
          selectionStart: textarea.selectionStart,
          selectionEnd: textarea.selectionEnd,
          value,
          timestamp: 0,
        },
      ];

      editorRef.current.session.history.offset = 0;
    }
  }, []);

  const initShiki = React.useCallback(() => {
    if (isShikiInitialized.current) return;
    isShikiInitialized.current = true;
    highlight('', {
      lang,
      ...highlighterConfig,
    }).then(() => {
      // initialized
    });
  }, []);

  React.useEffect(() => {
    const onRender = () => {
      if (!topRef.current) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (rect.top !== topRef.current) {
        const diff = rect.top - topRef.current;
        window.scrollBy({
          top: diff,
        });
      }
    };
    document.addEventListener('runnerRender', onRender);
    return () => {
      document.removeEventListener('runnerRender', onRender);
    };
  }, []);

  const topRef = React.useRef<number>(0);
  const handleFocus = React.useCallback(() => {
    topRef.current = containerRef.current?.getBoundingClientRect().top ?? 0;
    window.addEventListener('scroll', handleFocus, {
      passive: true,
    });
  }, []);

  const handleBlur = React.useCallback((e) => {
    topRef.current = 0;
    window.removeEventListener('scroll', handleFocus);
  }, []);

  return (
    <>
      <CopyButton
        className={cn(
          'absolute right-2 top-2 z-[2] backdrop-blur-md',
          numberOfLines <= 1 && 'top-1/2 -translate-y-1/2',
        )}
        onCopy={onCopy}
      />
      <div
        {...wrapper}
        className={cn(
          'group not-prose rounded-b-lg bg-fd-secondary/50 p-4 border text-sm overflow-x-auto',
          wrapper?.className,
        )}
        ref={containerRef}
      >
        <div className="relative *:w-max *:!pr-4 *:min-w-full">
          <Editor
            ref={editorRef}
            key={`${key}.${isPreview}`}
            value={value}
            onKeyDownCapture={handleKeyDown}
            onValueChange={setEditedCode}
            className="*:focus-visible:outline-0 *:selection:bg-fd-primary/20"
            highlight={highlighter}
            style={style}
            onFocus={initShiki}
            onFocusCapture={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>
    </>
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
          'size-7.5 p-0 hover:z-50',
          'transition-opacity group-hover:opacity-100 [&_svg]:size-3.5 backdrop-blur-md',
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
