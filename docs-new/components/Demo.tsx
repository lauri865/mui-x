import { templates } from '@/templates/templates';
import { getGitTrackedFiles } from '@/templates/utils';
import * as Tabs from '@radix-ui/react-tabs';
import { getParameters } from 'codesandbox/lib/api/define';
import fs from 'fs/promises';
import dynamic from 'next/dynamic';
import path from 'path';
import prettier from 'prettier';
import React from 'react';
import tsBlankSpace from 'ts-blank-space';
import { cn } from '../lib/cn';
import { DemoCollapsibleCodeBlock, DemoProvider, Resettable, Toolbar } from './demo/Demo.client';
import { DynamicCodeBlock } from './demo/dynamic-codeblock';
import { extractLastReturnFromJSX } from './demo/extractLastReturnFromJSX';
import { Runner } from './demo/Runner';
import { Wrapper } from './preview/wrapper';
import { TAB, TabValue } from './TabValue';

async function convertTypeScriptString(tsCode: string) {
  const result = tsBlankSpace(tsCode);

  const pretty = await prettier.format(result, {
    parser: 'typescript',
    singleQuote: true,
  });

  return pretty;
}

interface DemoProps {
  src: string;
  showPreview?: boolean;
}

const getDynamicComponent = (c: string) => {
  const path = `../examples/${c}`;

  return dynamic(() => import(path));
};

const stripFinalNewline = (str: string) => str.replace(/\n$/, '');

async function getComponentCode(src: string): Promise<string> {
  const componentPath = path.join(process.cwd(), './examples/', src);
  return fs.readFile(componentPath, 'utf-8');
}

async function getCodeSandboxUrl({
  template,
  name,
  src,
  lang,
}: {
  template: string;
  name: string;
  src: string;
  lang: TabValue;
}) {
  const baseFiles = await getGitTrackedFiles(template);
  const parameters = getParameters({
    files: {
      ...baseFiles,
      [`src/Demo.${lang}`]: {
        content: src,
        isBinary: false,
      },
      'package.json': {
        ...baseFiles['package.json'],
        content: baseFiles['package.json'].content
          .replace('{{name}}', `TWGrid – ${name.replace(/\.(t|j)sx$/, '')}`)
          .replace('{{description}}', 'https://github.com/twgrid/react/blob/main/examples/' + name),
      },
    },
  });
  const url = `https://codesandbox.io/api/v1/sandboxes/define?json=1`;
  const response = await fetch(url, {
    method: 'POST',
    body: new URLSearchParams({
      parameters,
    }),
  });
  const data = await response.json();
  return data.sandbox_id;
}

export async function Demo({ src, showPreview = false }: DemoProps) {
  const toolbarId = React.useId();
  const tsx = stripFinalNewline(await getComponentCode(src));
  const jsx = stripFinalNewline(await convertTypeScriptString(tsx));
  const tsxPreview = extractLastReturnFromJSX(jsx);
  const jsxPreview = extractLastReturnFromJSX(jsx);
  const sandboxIdTs = await getCodeSandboxUrl({
    template: templates.codesandbox[TAB.TS],
    name: src,
    src: tsx,
    lang: TAB.TS,
  });
  const sandboxIdJs = await getCodeSandboxUrl({
    template: templates.codesandbox[TAB.JS],
    name: src,
    src: jsx,
    lang: TAB.JS,
  });

  const code = {
    [TAB.TS]: tsx,
    [TAB.JS]: jsx,
    fileName: src,
  };

  const preview = showPreview
    ? {
        [TAB.TS]: tsxPreview,
        [TAB.JS]: jsxPreview,
      }
    : {
        [TAB.TS]: null,
        [TAB.JS]: null,
      };

  const InteractiveDemo = getDynamicComponent(src);
  return (
    <DemoProvider
      code={code}
      preview={preview}
      codeSandboxIds={{
        [TAB.TS]: sandboxIdTs,
        [TAB.JS]: sandboxIdJs,
      }}
      toolbarId={toolbarId}
    >
      <Wrapper className="rounded-b-none border">
        <Resettable>
          <Runner>
            <InteractiveDemo />
          </Runner>
        </Resettable>
      </Wrapper>
      <Toolbar>
        <Tabs.List className="flex">
          <LangTab value={TAB.TS}>TS</LangTab>
          <LangTab
            value={TAB.JS}
            className="data-[state=active]:text-amber-600 data-[state=active]:border-b-amber-600"
          >
            JS
          </LangTab>
        </Tabs.List>
      </Toolbar>
      <DemoCollapsibleCodeBlock>
        {Object.values(TAB).map((tab) => (
          <Tabs.Content key={tab} value={tab}>
            <DynamicCodeBlock
              lang={tab}
              wrapper={{
                className:
                  'm-0 border-0 rounded-t-none group-data-[state=closed]/collapsible:opacity-80 transition-opacity group-focus-within:!opacity-100',
              }}
            />
          </Tabs.Content>
        ))}
      </DemoCollapsibleCodeBlock>
    </DemoProvider>
  );
}

const LangTab = (props: any) => (
  <Tabs.Trigger
    {...props}
    className={cn(
      'flex items-center justify-center py-1.5 px-3 cursor-pointer data-[state=inactive]:*:!fill-white data-[state=active]:bg-fd-secondary   text-fd-foreground/50 data-[state=active]:text-fd-primary data-[state=inactive]:hover:text-fd-accent-foreground/50 border-b border-b-transparent data-[state=active]:border-b-fd-primary -mb-px z-1',
      props.className,
    )}
  >
    <div className="bg-current text-[10px] leading-none inline-flex items-center justify-center font-medium shadow-xs transition-all size-5 rounded-[4px]">
      <span className="text-white">{props.children}</span>
    </div>
  </Tabs.Trigger>
);

LangTab.displayName = Tabs.Trigger.displayName;
