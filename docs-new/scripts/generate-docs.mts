import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { generateDocumentation } from '../components/type-table/generate';

function slugifyInterfaceName(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Convert camelCase to kebab-case
    .replace(/[_\s]+/g, '-') // Replace underscores/spaces with dashes
    .toLowerCase();
}

const components = ['DataGrid'];
const interfaces = [
  'GridApi',
  // Cols
  'GridColDef',
  'GridSingleSelectColDef',
  'GridActionsColDef',
  'GridListColDef',
  // Rendering
  'GridCellParams',
  'GridRowParams',
  'GridRowClassNameParams',
  'GridRowSpacingParams',
  // RowGrouping
  'GridRowGroupingModel',
  // Filtering
  'GridFilterModel',
  'GridFilterItem',
  'GridFilterOperator',
  // Aggregation
  'GridAggregationFunction',
  // Exporting
  'GridExportStateParams',
  'GridCsvExportOptions',
  'GridPrintExportOptions',
];

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
    const name = slugifyInterfaceName(exportItem.replace(/^Grid/, ''));
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
