import * as Tabs from '@radix-ui/react-tabs';
import fs from 'fs/promises';
import dynamic from 'next/dynamic';
import path from 'path';
import prettier from 'prettier';
import tsBlankSpace from 'ts-blank-space';
import { cn } from '../lib/cn';
import { CodeBlock } from './code-block';
import { DemoCollapsibleCodeBlock, DemoProvider, Resettable, Toolbar } from './Demo.client';
import { Wrapper } from './preview/wrapper';
import { TAB } from './TabValue';

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

export async function Demo({ src }: DemoProps) {
  const tsx = stripFinalNewline(await getComponentCode(src));
  const jsx = stripFinalNewline(await convertTypeScriptString(tsx));

  const InteractiveDemo = getDynamicComponent(src);
  return (
    <DemoProvider code={{ [TAB.TS]: tsx, [TAB.JS]: jsx, fileName: src }}>
      <Wrapper className="rounded-b-none border">
        <Resettable>
          <InteractiveDemo />
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
        <Tabs.Content value={TAB.TS}>
          <CodeBlock
            lang="tsx"
            code={tsx}
            wrapper={{
              className: 'm-0 border-0 rounded-t-none opacity-90',
            }}
          />
        </Tabs.Content>
        <Tabs.Content value={TAB.JS}>
          <CodeBlock
            lang="jsx"
            code={jsx}
            wrapper={{
              className: 'm-0 border-0 rounded-t-none opacity-90',
            }}
          />
        </Tabs.Content>
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
