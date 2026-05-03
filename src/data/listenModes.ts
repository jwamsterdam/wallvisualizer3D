import type { ListenMode } from '../types';

export const listenModeOptions: Array<{ value: ListenMode; label: string }> = [
  { value: 'source', label: 'Origineel' },
  { value: 'existing', label: 'Door huidige muur' },
  { value: 'new', label: 'Door voorzetwand' },
];
