import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

type TemplateFiles = Record<string, { content: string; isBinary: boolean }>;
let templateFiles: Record<string, TemplateFiles> = {};
export async function getGitTrackedFiles(template: string) {
  if (templateFiles[template]) return templateFiles[template];
  const templateDir = path.join(process.cwd(), `./templates/${template}`);
  const files = execSync('git ls-files --others --cached --exclude-standard', {
    encoding: 'utf-8',
    cwd: templateDir,
  })
    .split('\n')
    .filter((f) => !!f && !f.match(/^\./) && !f.match(/\/\./g));

  const fileTree: TemplateFiles = {};

  for (const file of files) {
    fileTree[file] = {
      content: await fs.readFile(path.join(templateDir, file), 'utf8'),
      isBinary: false,
    };
  }

  templateFiles[template] = fileTree;
  return fileTree;
}
