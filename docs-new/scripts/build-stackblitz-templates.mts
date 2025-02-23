import { templates } from '@/templates/templates';
import { getGitTrackedFiles } from '@/templates/utils';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { TAB } from '../components/TabValue';

export const buildStackblitzTemplates = async () => {
  await Promise.all([
    buildTemplate(templates.stackblitz[TAB.TS]),
    buildTemplate(templates.stackblitz[TAB.JS]),
  ]);
};

async function buildTemplate(template: string) {
  execSync('npx -y pnpm@8 install --lockfile-only --ignore-workspace', {
    encoding: 'utf-8',
    cwd: path.join(process.cwd(), `./templates/${template}`),
  });

  const files = await getGitTrackedFiles(template);

  const flatObject = Object.entries(files).reduce(
    (acc, [file, { content }]) => {
      acc[file] = content;
      return acc;
    },
    {} as Record<string, string>,
  );

  // save under public/stackblitz
  const outPath = path.join(process.cwd(), './public/templates', `${template}.json`);

  await fs.writeFile(outPath, JSON.stringify(flatObject), 'utf-8');
  console.log(`Built stackblitz template for ${template} in ${outPath}`);
  return;
}
