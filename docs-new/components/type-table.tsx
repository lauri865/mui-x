/* import { highlight } from 'fumadocs-core/highlight'; */

import { createTypeTable } from './type-table/AutoTypeTable';

/* import { highlighterConfig } from '../lib/constants'; */

export const { AutoTypeTable } = createTypeTable({
  allowInternal: false,
});
