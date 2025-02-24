'use client';
import { templates } from '@/templates/templates';
import { Root as TabsRoot } from '@radix-ui/react-tabs';
import StackBlitz from '@stackblitz/sdk';
import { Collapsible, CollapsibleContent } from 'fumadocs-ui/components/ui/collapsible';
import { CopyCheckIcon, CopyIcon, LightbulbIcon, RotateCcwIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '../../lib/cn';
import { TAB, TabValue } from '../TabValue';
import { buttonVariants } from '../ui/button';
import { Tooltip } from '../ui/tooltip';
import { DemoContext, DemoContextValue, useDemoContext } from './DemoContext';
import { DownloadButton } from './DownloadButton';
import { extractLastReturnFromJSX } from './extractLastReturnFromJSX';

const subscribeToLocalStorage = (listener: () => void) => {
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener('storage', listener);
  };
};
const getClientSnapshot = () => {
  const savedValue = localStorage.getItem('docs.code.lang');
  if (savedValue === TAB.JS || savedValue === TAB.TS) return savedValue;
  return TAB.TS;
};
const getServersideSnapshot = () => TAB.TS;

export const DemoProvider = (props: {
  children: React.ReactNode;
  code: DemoContextValue['code'];
  preview: DemoContextValue['preview'];
  codeSandboxIds: DemoContextValue['codeSandboxIds'];
  toolbarId: string;
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [editedCode, setEditedCode] = React.useState<string | null>(null);
  const [key, setKey] = React.useState('0');
  const value = React.useSyncExternalStore(
    subscribeToLocalStorage,
    getClientSnapshot,
    getServersideSnapshot,
  );
  const activeTabRef = React.useRef<TabValue>(TAB.TS);
  const reset = () => {
    setEditedCode(null);
    setKey((key) => String(Number(key) + 1));
  };

  const hasPreview = props.preview[activeTabRef.current] !== null;
  const tabInitialCode = props.code[activeTabRef.current].replace(/^[\s\n]*'use client';\n*/gm, '');
  const context = React.useMemo(
    () => ({
      key,
      code: props.code,
      preview: props.preview,
      activeTabRef,
      reset,
      codeSandboxIds: props.codeSandboxIds,
      editedCode,
      setEditedCode,
      isExpanded,
      setIsExpanded: ((value) => {
        const expanded = typeof value === 'function' ? value(isExpanded) : value;

        if (hasPreview) {
          if (!expanded) {
            if (editedCode) {
              setEditedCode((edits) => {
                return extractLastReturnFromJSX(edits!);
              });
            }
          } else {
            if (editedCode) {
              setEditedCode((edits) => {
                return tabInitialCode.replace(props.preview[activeTabRef.current]!, edits!);
              });
            }
          }
        }

        setIsExpanded(expanded);
      }) as DemoContextValue['setIsExpanded'],
      hasPreview,
      isPreview: hasPreview && !isExpanded,
      tabInitialCode,
      toolbarId: props.toolbarId,
    }),
    [key, props.codeSandboxIds, props.code, editedCode, isExpanded, hasPreview],
  );

  return (
    <DemoContext.Provider value={context}>
      <TabsRoot
        value={value}
        onValueChange={(value) => {
          if (!value) return;

          activeTabRef.current = value as TabValue;
          localStorage.setItem('docs.code.lang', value);
          window.dispatchEvent(
            new StorageEvent('storage', { key: 'docs.code.lang', newValue: value }),
          );
          setEditedCode(null);
        }}
      >
        {props.children}
      </TabsRoot>
    </DemoContext.Provider>
  );
};

export const Resettable = (props: { children: React.ReactNode }) => {
  const { key } = React.useContext(DemoContext);
  return <React.Fragment key={key}>{props.children}</React.Fragment>;
};

export const DemoCollapsibleCodeBlock = (props: { children: React.ReactNode }) => {
  const { isExpanded, setIsExpanded, preview, activeTabRef, editedCode, hasPreview, isPreview } =
    useDemoContext();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isExpandable, setIsExpandable] = React.useState<boolean | null>(true);
  const isAnimationPrevented = React.useRef(true);

  React.useEffect(() => {
    isAnimationPrevented.current = false;

    const observer = new ResizeObserver((entries) => {
      const hasPreview = preview[activeTabRef.current] !== null;
      if (hasPreview) return;
      const { height } = entries[0].contentRect;
      setIsExpanded((isExanded) => {
        if (height > 150) return isExanded;
        return true;
      });
      setIsExpandable(height > 150);
    });
    observer.observe(containerRef.current!);
    return () => observer.disconnect();
  }, []);

  return (
    <Collapsible open={isExpandable === false || isExpanded} onOpenChange={setIsExpanded} asChild>
      <div className="group @container relative border rounded-b-lg group/collapsible">
        <CollapsibleContent
          className={cn(
            'overflow-hidden',
            '!animate-none',
            !isPreview &&
              'peer data-[state=closed]:max-h-[150px] not-focus-within:data-[state=closed]:fade-bottom',
          )}
          forceMount
          onClick={() => {
            if (isPreview) {
              return;
            }
            if (!isExpanded) {
              setIsExpanded(true);
            }
          }}
        >
          <div ref={containerRef}>{props.children}</div>
        </CollapsibleContent>

        <div className="flex items-center gap-1 absolute bottom-3 right-3 text-xs text-fd-foreground/50 select-none pointer-events-none group-data-[state=open]/collapsible:hidden rounded-full @max-md:hidden peer-focus-within:hidden">
          <LightbulbIcon className="size-3.5" /> Live edit the demo code
        </div>

        {isExpandable && (
          <button
            className={cn(
              'absolute bottom-2 left-1/2 -translate-x-1/2 shadow-xs @',
              buttonVariants({
                variant: 'secondary',
                size: 'xs',
              }),
              'px-2 py-1',
              isPreview && '-bottom-6.5 rounded-t-none',
            )}
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded ? 'Collapse code' : 'Expand code'}
          </button>
        )}
      </div>
    </Collapsible>
  );
};

const toolbarBtnClasses = cn(buttonVariants({ variant: 'ghost' }), 'size-7 p-0 ', '[&_svg]:size-4');
export const Toolbar = (props: { children: React.ReactNode }) => {
  const { reset, toolbarId } = useDemoContext();
  return (
    <div
      className="relative flex items-center justify-between pr-2 bg-fd-secondary border-x shadow-[0_-3px_3px_-2px_#00000020] border-t border-t-white/40 dark:border-t-transparent"
      id={toolbarId}
    >
      {props.children}

      <div className="flex gap-1 items-center h-full">
        <StackblitzButton />
        <CodesandboxButton />
        {/* <CopyButton /> */}
        <DownloadButton className={toolbarBtnClasses} />
        <GithubButton />

        <div className="h-[20px] w-px mx-1 bg-fd-ring/20" />
        <Tooltip title="Reset demo">
          <button className={cn(toolbarBtnClasses)} onClick={reset}>
            <RotateCcwIcon />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

const GithubButton = () => {
  const { activeTabRef, code } = useDemoContext();

  const openInCodeSandbox = () => {};

  return (
    <Tooltip title={'Open in Github'}>
      <a
        href={`https://github.com/twgrid/react/blob/main/docs/examples/${code.fileName}`}
        target="_blank"
      >
        <button className={cn(toolbarBtnClasses)} onClick={openInCodeSandbox}>
          <GithubIcon />
        </button>
      </a>
    </Tooltip>
  );
};

const CodesandboxButton = () => {
  const { activeTabRef, code, codeSandboxIds } = useDemoContext();

  const openInCodeSandbox = () => {
    const sandboxId = codeSandboxIds[activeTabRef.current];
    if (!sandboxId) return;
    const url = `https://codesandbox.io/p/sandbox/${sandboxId}?embed=1&file=/src/Demo.${activeTabRef.current}`;
    window.open(url, '_blank');
  };

  return (
    <Tooltip title={'Open in CodeSandbox'}>
      <button className={cn(toolbarBtnClasses)} onClick={openInCodeSandbox}>
        <CodesandboxIcon />
      </button>
    </Tooltip>
  );
};

const StackblitzButton = () => {
  const { activeTabRef, code } = useDemoContext();

  const openInStackBlitz = async () => {
    const activeTab = activeTabRef.current;
    const template = templates.stackblitz[activeTab];
    const files = await fetch(`/templates/${template}.json`).then((res) => res.json());

    files[`src/Demo.${activeTab}`] = code[activeTab];

    files['package.json'] = files['package.json'].replace(
      '{{name}}',
      `TWGrid – ${code.fileName.replace(/\.(t|j)sx$/, '')}`,
    );
    files['package.json'] = files['package.json'].replace(
      '{{description}}',
      `https://github.com/twgrid/react/blob/main/docs/examples/${code.fileName}`,
    );

    StackBlitz.openProject(
      {
        files,
        title: `TWGrid – ${code.fileName.replace(/\.(t|j)sx$/, '')}`,
        description: `https://github.com/twgrid/react/blob/main/docs/examples/${code.fileName}`,
        template: 'node',
      },
      {
        openFile: `src/Demo.${activeTab}`,
      },
    );
  };

  return (
    <Tooltip title={'Open in StackBlitz'}>
      <button className={cn(toolbarBtnClasses)} onClick={openInStackBlitz}>
        <StackblitzIcon />
      </button>
    </Tooltip>
  );
};

const CodesandboxIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M0 24H24V0H0V2.45455H21.5455V21.5455H2.45455V0H0Z" />
  </svg>
);

const StackblitzIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path d="M10.797 14.182H3.635L16.728 0l-3.525 9.818h7.162L7.272 24l3.524-9.818Z" />
  </svg>
);

const GithubIcon = () => (
  <svg
    viewBox="0 0 256 250"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
  >
    <path d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46 6.397 1.185 8.746-2.777 8.746-6.158 0-3.052-.12-13.135-.174-23.83-35.61 7.742-43.124-15.103-43.124-15.103-5.823-14.795-14.213-18.73-14.213-18.73-11.613-7.944.876-7.78.876-7.78 12.853.902 19.621 13.19 19.621 13.19 11.417 19.568 29.945 13.911 37.249 10.64 1.149-8.272 4.466-13.92 8.127-17.116-28.431-3.236-58.318-14.212-58.318-63.258 0-13.975 5-25.394 13.188-34.358-1.329-3.224-5.71-16.242 1.24-33.874 0 0 10.749-3.44 35.21 13.121 10.21-2.836 21.16-4.258 32.038-4.307 10.878.049 21.837 1.47 32.066 4.307 24.431-16.56 35.165-13.12 35.165-13.12 6.967 17.63 2.584 30.65 1.255 33.873 8.207 8.964 13.173 20.383 13.173 34.358 0 49.163-29.944 59.988-58.447 63.157 4.591 3.972 8.682 11.762 8.682 23.704 0 17.126-.148 30.91-.148 35.126 0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128.002 256 57.307 198.691 0 128.001 0Zm-80.06 182.34c-.282.636-1.283.827-2.194.39-.929-.417-1.45-1.284-1.15-1.922.276-.655 1.279-.838 2.205-.399.93.418 1.46 1.293 1.139 1.931Zm6.296 5.618c-.61.566-1.804.303-2.614-.591-.837-.892-.994-2.086-.375-2.66.63-.566 1.787-.301 2.626.591.838.903 1 2.088.363 2.66Zm4.32 7.188c-.785.545-2.067.034-2.86-1.104-.784-1.138-.784-2.503.017-3.05.795-.547 2.058-.055 2.861 1.075.782 1.157.782 2.522-.019 3.08Zm7.304 8.325c-.701.774-2.196.566-3.29-.49-1.119-1.032-1.43-2.496-.726-3.27.71-.776 2.213-.558 3.315.49 1.11 1.03 1.45 2.505.701 3.27Zm9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033-1.448-.439-2.395-1.613-2.103-2.626.301-1.01 1.747-1.484 3.207-1.028 1.446.436 2.396 1.602 2.095 2.622Zm10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95-1.53.034-2.769-.82-2.786-1.86 0-1.065 1.202-1.932 2.733-1.958 1.522-.03 2.768.818 2.768 1.868Zm10.555-.405c.182 1.03-.875 2.088-2.387 2.37-1.485.271-2.861-.365-3.05-1.386-.184-1.056.893-2.114 2.376-2.387 1.514-.263 2.868.356 3.061 1.403Z" />
  </svg>
);

const CopyButton = () => {
  const [copied, setCopied] = React.useState(false);
  const { activeTabRef, code } = useDemoContext();

  const handleCopy = () => {
    const codeToCopy = code[activeTabRef.current];
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
      <button
        className={cn(toolbarBtnClasses, copied && '!bg-fd-primary/10 !text-fd-primary')}
        onClick={handleCopy}
      >
        {copied ? <CopyCheckIcon /> : <CopyIcon />}
      </button>
    </Tooltip>
  );
};
