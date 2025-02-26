import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { generateDocumentation } from '../components/type-table/generate';
import { components, interfaces, slugifyInterfaceName } from '../lib/public-interfaces.js';

function generateMdxContent(name: string, typeName: string, isComponent: boolean) {
  return `---
title: ${name}
description: ${typeName} ${isComponent ? 'Component' : 'Interface'} reference documentation.
icon: ${isComponent ? 'Puzzle' : 'Braces'}
---

## Overview

<AutoTypeTable
  path="../packages/x-data-grid/src/index.ts" name="${typeName}"
  interface={${!isComponent ? true : false}}
/>
`;
}

export async function generateDocs() {
  const outDir = './content/docs/reference';
  const publicExports = [...components, ...interfaces];

  for (const exportItem of publicExports) {
    const name = slugifyInterfaceName(exportItem);
    const filePath = `${outDir}/${name}.mdx`;

    if (existsSync(filePath)) {
      console.log(`Skipping existing file: ${exportItem}`);
      continue;
    }

    try {
      console.log(`Generating documentation for: ${exportItem} in ${filePath}`);
      const content = generateMdxContent(
        exportItem.replace(/^Grid/, ''),
        exportItem,
        components.includes(exportItem),
      );
      await writeFile(filePath, content, 'utf-8');
    } catch (error) {
      console.error(`Error generating docs for ${exportItem}:`, error);
    }
  }

  const interfacesDir = `./content/interfaces`;
  for (const exportItem of publicExports) {
    const isComponent = components.includes(exportItem);
    const name = isComponent ? `${exportItem}Props` : exportItem;

    // overwrite
    const content = (await readFile(`../packages/x-data-grid/src/index.ts`)).toString();
    const props = await generateDocumentation(
      `../packages/x-data-grid/src/index.ts`,
      name,
      content,
    );

    // overwrite existing

    const filePath = `${interfacesDir}/${name}.json`;
    await writeFile(filePath, JSON.stringify(props, null, 2), 'utf-8');
  }

  console.log('Documentation generation completed.');
}

generateDocs();
