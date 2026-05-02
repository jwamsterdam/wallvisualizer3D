import type { ListenMode } from '../types';

export const listenModeOptions: Array<{ value: ListenMode; label: string }> = [
  { value: 'source', label: 'Bron' },
  { value: 'existing', label: 'Huidige muur' },
  { value: 'new', label: 'Nieuwe muur' },
];
