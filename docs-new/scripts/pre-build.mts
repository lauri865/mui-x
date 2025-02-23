import { buildRegistry } from '@/scripts/build-registry.mjs';
import { generateDocs } from '@/scripts/generate-docs.mjs';
import { spawn } from 'child_process';
import { buildStackblitzTemplates } from './build-stackblitz-templates.mjs';

async function main() {
  await Promise.all([generateDocs(), buildRegistry()]);
}

await main().catch((e) => {
  console.error('Failed to run pre build script', e);
});

// generate demo zip files
spawn(
  './scripts/build-demo-zip.sh',
  ['./templates/typescript-vite', './public/templates/demo-tsx.zip'],
  {
    stdio: 'inherit',
  },
);
spawn('./scripts/build-demo-zip.sh', ['./templates/js-vite', './public/templates/demo-jsx.zip'], {
  stdio: 'inherit',
});

buildStackblitzTemplates();
