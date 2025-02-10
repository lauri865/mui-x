import { buildRegistry } from '@/scripts/build-registry.mjs';
import { generateDocs } from '@/scripts/generate-docs.mjs';

async function main() {
  await Promise.all([generateDocs(), buildRegistry()]);
}

await main().catch((e) => {
  console.error('Failed to run pre build script', e);
});
