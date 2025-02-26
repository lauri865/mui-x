/// <reference types="react/experimental" />
import sourceConfig from '@/source.config';
import { type MDXOptions } from '@fumadocs/mdx-remote';
import { evaluate, UseMdxComponents } from '@mdx-js/mdx';
import { rehypeCode, remarkGfm } from 'fumadocs-core/mdx-plugins';
import { getProject } from 'fumadocs-typescript';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { type Jsx } from 'hast-util-to-jsx-runtime';
import Link from 'next/link';
import fs from 'node:fs/promises';
import * as React from 'react';
import * as runtime from 'react/jsx-runtime';
import rehypeReact from 'rehype-react';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import 'server-only';
import { unified } from 'unified';
import { cn } from '../../lib/cn';
import { generateDocumentation, type GenerateDocumentationOptions } from './generate';
import { TypeTable } from './TypeTable';

const remarkPlugins = (sourceConfig.mdxOptions as MDXOptions).remarkPlugins ?? [];
const baseRehypePlugins = [
  [rehypeCode, (sourceConfig.mdxOptions as MDXOptions).rehypeCodeOptions],
] as any;
const rehypePlugins = (sourceConfig.mdxOptions as MDXOptions).rehypePlugins ?? [];

const compileToReact = async (code: string, components: ReturnType<UseMdxComponents> = {}) => {
  if (!code) return null;
  try {
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(
        typeof remarkPlugins === 'function'
          ? [...remarkPlugins([])].filter(Boolean)
          : [...remarkPlugins].filter(Boolean),
      )
      .use(remarkRehype)

      .use(
        typeof rehypePlugins === 'function'
          ? rehypePlugins([[rehypeCode, (sourceConfig.mdxOptions as MDXOptions).rehypeCodeOptions]])
          : [...baseRehypePlugins, ...rehypePlugins],
      )
      .use(rehypeReact, {
        ...runtime,
        components: {
          ...defaultMdxComponents,
          Link,
          hr: () => <hr />,
          ...components,
        },
      })
      .process(escapeMarkdown(code));

    return file.result;
  } catch (error) {
    console.log('error', error, 'code', code);
  }
  return null;
};

const compileToReact2 = async (code: string, components: ReturnType<UseMdxComponents> = {}) => {
  if (!code) return null;
  try {
    const { default: Content } = await evaluate(escapeMarkdown(code), {
      Fragment: runtime.Fragment,
      jsx: runtime.jsx as Jsx,
      jsxs: runtime.jsxs as Jsx,
      useMDXComponents: () => ({
        ...defaultMdxComponents,
        Link,
        hr: () => <hr />,
        ...components,
      }),
      remarkPlugins:
        typeof remarkPlugins === 'function'
          ? [...remarkPlugins([])].filter(Boolean)
          : [...remarkPlugins].filter(Boolean),
      rehypePlugins:
        typeof rehypePlugins === 'function'
          ? rehypePlugins([[rehypeCode, (sourceConfig.mdxOptions as MDXOptions).rehypeCodeOptions]])
          : [...baseRehypePlugins, ...rehypePlugins],
    });

    return <Content />;
  } catch (error) {
    console.log('error', error, 'code', code);
  }
  return null;
};

export interface AutoTypeTableProps {
  /**
   * The path to source TypeScript file.
   */
  path?: string;

  /**
   * Exported type name to generate from.
   */
  name?: string;

  /**
   * Set the type to generate from.
   *
   * When used with `name`, it generates the type with `name` as export name.
   *
   * ```ts
   * export const myName = MyType;
   * ```
   *
   * When `type` contains multiple lines, `export const` is not added.
   * You need to export it manually, and specify the type name with `name`.
   *
   * ```tsx
   * <AutoTypeTable
   *   path="./file.ts"
   *   type={`import { ReactNode } from "react"
   *   export const MyName = ReactNode`}
   *   name="MyName"
   * />
   * ```
   */
  type?: string;

  showRequired?: boolean;

  options?: GenerateDocumentationOptions;
}

export function createTypeTable(options: GenerateDocumentationOptions = {}): {
  AutoTypeTable: (props: Omit<AutoTypeTableProps, 'options'>) => React.ReactNode;
} {
  const project = options.project ?? getProject(options.config);

  return {
    AutoTypeTable(props) {
      return <AutoTypeTableBase {...props} options={{ ...options, project }} />;
    },
  };
}

const inlineCodeComponents: ReturnType<UseMdxComponents> = {
  code: ({ children }) => <code className="nd-copy-ignore not-prose">{children}</code>,
  pre: ({ children, className }) => (
    <pre className={cn('nd-copy-ignore not-prose whitespace-pre-wrap', className)}>{children}</pre>
  ),
};

/**
 * **Server Component Only**
 *
 * Display properties in an exported interface via Type Table
 */
export async function AutoTypeTableBase({
  path,
  name,
  type,
  showRequired,
  options = {},
}: AutoTypeTableProps): Promise<React.ReactElement> {
  let typeName = name;
  let content = '';

  console.time('generate');
  if (path) {
    content = (await fs.readFile(path)).toString();
  }

  if (type && type.split('\n').length > 1) {
    content += `\n${type}`;
  } else if (type) {
    typeName ??= '$Fumadocs';
    content += `\nexport type ${typeName} = ${type}`;
  }

  const output = await generateDocumentation(path ?? 'temp.ts', typeName, content, options);
  console.timeEnd('generate');

  const hideDefault = !output.some((item) =>
    item.entries.some((entry) => entry.tags.default || entry.tags.defaultValue),
  );

  if (name && output.length === 0)
    throw new Error(`${name} in ${path ?? 'empty file'} doesn't exist`);

  console.time('render');
  const table = await Promise.all(
    output.map(async (item) => {
      const entries = item.entries.map(async (entry) => {
        const [type, typeDescription, description] = await Promise.all([
          await compileToReact('```tsx\n' + entry.type + '\n```', inlineCodeComponents),
          entry.typeDescription
            ? await compileToReact(
                entry.typeDescription.includes('---')
                  ? entry.typeDescription
                      .split('\n---\n')
                      .map((line, index) => {
                        if (line.startsWith('Returns'))
                          return line.replace('Returns:', '**Returns:**');
                        return `\`\`\`ts\n${line}\n\`\`\``;
                      })
                      .join('\n---\n')
                  : `\`\`\`ts\n${entry.typeDescription}\n\`\`\``,
                inlineCodeComponents,
              )
            : undefined,
          await compileToReact(entry.description),
        ]);
        return [
          entry.name,
          {
            type,
            typeDescription,
            description,
            default: entry.tags.default || entry.tags.defaultValue,
            required: entry.tags.required === 'true',
            typeDescriptionLink: entry.link
              ? `https://github.com/twgrid/react/blob/master${entry.link}`
              : undefined,
          },
        ] as const;
      });

      return (
        <TypeTable
          key={item.name}
          type={Object.fromEntries(await Promise.all(entries))}
          showRequired={showRequired}
          hideDefault={hideDefault}
        />
      );
    }),
  );
  console.timeEnd('render');

  return <>{table}</>;
}

function escapeMarkdown(markdown: string) {
  let inMultiLineCodeBlock = false;
  let inInlineCodeBlock = false;

  return markdown
    .split('\n')
    .map((line) => {
      // Toggle multi-line code block state
      if (line.trim().startsWith('```')) {
        inMultiLineCodeBlock = !inMultiLineCodeBlock;
        return line;
      }

      // Process each character in the line
      let result = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        // Toggle inline code block state
        if (char === '`' && !inMultiLineCodeBlock) {
          inInlineCodeBlock = !inInlineCodeBlock;
          result += char;
          continue;
        }

        // Replace angle brackets only outside code blocks
        if (!inMultiLineCodeBlock && !inInlineCodeBlock) {
          if (char === '<') result += '&lt;';
          else if (char === '>') result += '&gt;';
          else if (char === '{') result += '&#123;';
          else if (char === '}') result += '&#125;';
          else result += char;
        } else {
          result += char; // Leave code blocks untouched
        }
      }

      return result;
    })
    .join('\n');
}
