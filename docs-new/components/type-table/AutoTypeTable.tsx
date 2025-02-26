/// <reference types="react/experimental" />
import { highlight } from 'fumadocs-core/highlight';
import { getProject, renderMarkdownToHast } from 'fumadocs-typescript';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { type Jsx, toJsxRuntime } from 'hast-util-to-jsx-runtime';
import fs from 'node:fs/promises';
import * as runtime from 'react/jsx-runtime';
import 'server-only';
import { ShikiTransformer } from 'shiki';
import { highlighterConfig } from '../../lib/constants';
import { generateDocumentation, type GenerateDocumentationOptions } from './generate';
import { TypeTable } from './TypeTable';

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

  const hideDefault = !output.some((item) =>
    item.entries.some((entry) => entry.tags.default || entry.tags.defaultValue),
  );

  if (name && output.length === 0)
    throw new Error(`${name} in ${path ?? 'empty file'} doesn't exist`);

  return (
    <>
      {output.map(async (item) => {
        const entries = item.entries.map(
          async (entry) =>
            [
              entry.name,
              {
                type: await highlight(entry.type, {
                  lang: 'ts',
                  ...highlighterConfig,
                  components: {
                    code: ({ children }) => (
                      <code className="nd-copy-ignore not-prose">{children}</code>
                    ),
                  },
                }),
                typeDescription: entry.typeDescription
                  ? await highlight(entry.typeDescription, {
                      lang: 'ts',
                      ...highlighterConfig,
                      components: {
                        code: ({ children }) => (
                          <code className="nd-copy-ignore not-prose whitespace-pre-wrap">
                            {children}
                          </code>
                        ),
                        hr: () => <hr />,
                      },
                      transformers: [createMarkdownTransformer()],
                    })
                  : undefined,
                description: await renderMarkdown(entry.description),
                default: entry.tags.default || entry.tags.defaultValue,
                required: entry.tags.required === 'true',
                typeDescriptionLink: entry.link
                  ? `https://github.com/mui/mui-x/blob/master${entry.link}`
                  : undefined,
              },
            ] as const,
        );

        return (
          <TypeTable
            key={item.name}
            type={Object.fromEntries(await Promise.all(entries))}
            showRequired={showRequired}
            hideDefault={hideDefault}
          />
        );
      })}
    </>
  );
}

async function renderMarkdown(md: string): Promise<React.ReactElement> {
  return toJsxRuntime(await renderMarkdownToHast(md.replace(/\n/g, '\n\n')), {
    Fragment: runtime.Fragment,
    jsx: runtime.jsx as Jsx,
    jsxs: runtime.jsxs as Jsx,
    components: { ...defaultMdxComponents, img: undefined },
  });
}

export function createMarkdownTransformer(): ShikiTransformer {
  return {
    name: 'rehype-code:markdown',
    line(hast) {
      hast.children = hast.children.map((node) => {
        if (node.type === 'element' && Array.isArray(node.children)) {
          node.children = node.children.map((child) => {
            if (child.type === 'text' && child.value === '---') {
              return {
                type: 'element',
                tagName: 'hr',
                properties: {},
                children: [],
              };
            }
            return child;
          });
        }
        return node;
      });
    },
  };
}
