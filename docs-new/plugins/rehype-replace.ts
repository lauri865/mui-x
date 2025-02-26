import type { ElementContent, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { allInterfaces, replaceTokens, slugifyInterfaceName } from '../lib/public-interfaces';

const autoTokens = Object.fromEntries(
  replaceTokens.map((token) => [token, `/docs/reference/${slugifyInterfaceName(token)}`]),
) as Record<(typeof allInterfaces)[number], string>;

const TOKEN_MAP: Record<string, string> = {
  ...autoTokens,
  // ADD custom tokens below
  GridFilterItem: autoTokens.GridFilterModel + '#filteritem',
  GridFilterCondition: autoTokens.GridFilterModel + '#filtercondition',
  GridStateColDef: autoTokens.GridColDef,
};

// Sort by length so we don't replace a token with a partial match
const TOKEN_ENTRIES = Object.entries(TOKEN_MAP).sort((a, b) => b[0].length - a[0].length);

export const rehypeReplaceTokens: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || typeof node.value !== 'string') return;

      const replacedTokens: string[] = [];
      for (const [token, href] of TOKEN_ENTRIES) {
        if (node.value.includes(token) || node.value.includes(`[[${token}]]`)) {
          const parts = node.value.includes(`[[${token}]]`)
            ? node.value.split(`[[${token}]]`)
            : node.value.split(token);
          const newChildren: ElementContent[] = [];

          // prevent double-wrapping of links
          // when SSRing the Link will become an anchor tag
          if (
            parent.type === 'element' &&
            (parent.tagName === 'a' || parent.tagName === 'Link' || parent.tagName.startsWith('h'))
          ) {
            return;
          }

          const plainToken = token.replace(/^\[\[|\]\]$/g, '');
          const replacedAlready = replacedTokens.some(
            (replaced) => replaced.startsWith(plainToken) || plainToken.startsWith(replaced),
          );
          if (replacedAlready) continue;

          replacedTokens.push(token);

          parts.forEach((part, i) => {
            if (part) newChildren.push({ type: 'text', value: part });
            if (i < parts.length - 1) {
              newChildren.push({
                type: 'element',
                tagName: 'Link',
                properties: {
                  href,
                  className: 'twg-autolink',
                  title: 'Read the referencep',
                },
                children: [
                  {
                    type: 'text',
                    value: plainToken,
                  },
                ],
              });
            }
          });

          parent.children.splice(index!, 1, ...newChildren);
        }
      }
    });
  };
};
