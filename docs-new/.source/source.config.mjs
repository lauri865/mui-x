// source.config.ts
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import {
  fileGenerator,
  remarkDocGen,
  remarkInstall,
  remarkTypeScriptToJavaScript
} from "fumadocs-docgen";
import {
  defineCollections,
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema
} from "fumadocs-mdx/config";
import { transformerTwoslash } from "fumadocs-twoslash";
import remarkGithub, { defaultBuildUrl } from "remark-github";
import remarkMath from "remark-math";
import { z } from "zod";

// lib/constants.ts
var highlighterConfig = {
  themes: {
    light: "github-light",
    dark: "github-dark-default"
  },
  colorReplacements: {
    "github-light": {
      "#032f62": "var(--color-blue-600)"
    },
    "github-dark-default": {
      "#a5d6ff": "var(--color-teal-400)"
    }
  }
};

// plugins/rehype-replace.ts
import { visit } from "unist-util-visit";

// lib/public-interfaces.ts
function slugifyInterfaceName(name) {
  return name.replace(/^Grid/, "").replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[_\s]+/g, "-").toLowerCase();
}
var components = ["DataGrid"];
var interfaces = [
  "GridApi",
  "GridEvents",
  "GridInitialState",
  // Cols
  "GridColDef",
  "GridSingleSelectColDef",
  "GridActionsColDef",
  "GridListColDef",
  "GridAutosizeOptions",
  // Rendering
  "GridCellParams",
  "GridRowParams",
  "GridRowClassNameParams",
  "GridRowSpacingParams",
  // RowGrouping
  //'GridRowGroupingModel',
  // Filtering
  "GridFilterModel",
  "GridFilterCondition",
  "GridFilterItem",
  "GridFilterOperator",
  // Aggregation
  "GridAggregationFunction",
  // Exporting
  "GridExportStateParams",
  "GridCsvExportOptions",
  "GridPrintExportOptions"
];
var allInterfaces = [...components, ...interfaces];
var replaceTokens = [
  // Components can be JSX tags or refer to their props
  ...components.map((c) => [c, `<${c} />`, `${c}Props`, `${c}Component`]).flat(),
  ...interfaces
];

// plugins/rehype-replace.ts
var autoTokens = Object.fromEntries(
  replaceTokens.map((token) => [token, `/docs/reference/${slugifyInterfaceName(token)}`])
);
var TOKEN_MAP = {
  ...autoTokens,
  // ADD custom tokens below
  GridFilterItem: autoTokens.GridFilterModel + "#filteritem",
  GridFilterCondition: autoTokens.GridFilterModel + "#filtercondition",
  GridStateColDef: autoTokens.GridColDef
};
var TOKEN_ENTRIES = Object.entries(TOKEN_MAP).sort((a, b) => b[0].length - a[0].length);
var rehypeReplaceTokens = () => {
  return (tree) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || typeof node.value !== "string") return;
      const replacedTokens = [];
      for (const [token, href] of TOKEN_ENTRIES) {
        if (node.value.includes(token) || node.value.includes(`[[${token}]]`)) {
          const parts = node.value.includes(`[[${token}]]`) ? node.value.split(`[[${token}]]`) : node.value.split(token);
          const newChildren = [];
          if (parent.type === "element" && (parent.tagName === "a" || parent.tagName === "Link" || parent.tagName.startsWith("h"))) {
            return;
          }
          const plainToken = token.replace(/^\[\[|\]\]$/g, "");
          const replacedAlready = replacedTokens.some(
            (replaced) => replaced.startsWith(plainToken) || plainToken.startsWith(replaced)
          );
          if (replacedAlready) continue;
          replacedTokens.push(token);
          parts.forEach((part, i) => {
            if (part) newChildren.push({ type: "text", value: part });
            if (i < parts.length - 1) {
              newChildren.push({
                type: "element",
                tagName: "Link",
                properties: {
                  href,
                  className: "twg-autolink",
                  title: "Read the referencep"
                },
                children: [
                  {
                    type: "text",
                    value: plainToken
                  }
                ]
              });
            }
          });
          parent.children.splice(index, 1, ...newChildren);
        }
      }
    });
  };
};

// source.config.ts
var docs = defineDocs({
  docs: {
    async: true,
    schema: frontmatterSchema.extend({
      preview: z.string().optional(),
      index: z.boolean().default(false),
      /**
       * API routes only
       */
      method: z.string().optional()
    })
  },
  meta: {
    schema: metaSchema.extend({
      description: z.string().optional()
    })
  }
});
var blog = defineCollections({
  type: "doc",
  dir: "content/blog",
  async: true,
  schema: frontmatterSchema.extend({
    author: z.string(),
    date: z.string().date().or(z.date()).optional()
  })
});
var source_config_default = defineConfig({
  lastModifiedTime: "git",
  mdxOptions: {
    rehypeCodeOptions: {
      lazy: true,
      experimentalJSEngine: true,
      langs: ["ts", "js", "html", "tsx", "mdx"],
      inline: "tailing-curly-colon",
      ...highlighterConfig,
      transformers: [
        ...rehypeCodeDefaultOptions.transformers ?? [],
        transformerTwoslash(),
        {
          name: "transformers:remove-notation-escape",
          code(hast) {
            for (const line of hast.children) {
              if (line.type !== "element") continue;
              const lastSpan = line.children.findLast((v) => v.type === "element");
              const head = lastSpan?.children[0];
              if (head?.type !== "text") return;
              head.value = head.value.replace(/\[\\!code/g, "[!code");
            }
          }
        }
      ]
    },
    remarkPlugins: [
      remarkMath,
      [remarkInstall, { persist: { id: "package-manager" } }],
      [remarkDocGen, { generators: [fileGenerator()] }],
      remarkTypeScriptToJavaScript,
      [
        remarkGithub,
        {
          repository: "facebook/react",
          buildUrl(values) {
            return values.type === "mention" ? false : defaultBuildUrl(values);
          }
        }
      ]
    ],
    rehypePlugins: (v) => [...v, rehypeReplaceTokens]
  }
});
export {
  blog,
  source_config_default as default,
  docs
};
