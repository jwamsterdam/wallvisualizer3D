import type { Material } from '../../types';

export type { ListenMode } from '../../types';

export interface ConstructionLayer {
  id: string;
  materialId: string;
  thicknessMm: number;
}

export interface FrequencyBandResult {
  frequencyHz: number;
  attenuationDb: number;
  notes?: string[];
}

export type DetectedSystemType =
  | 'single_leaf'
  | 'bonded_mass'
  | 'mass_spring_mass'
  | 'mass_spring_mass_spring_mass'
  | 'mixed_or_ambiguous';

export interface SimulationResult {
  bands: FrequencyBandResult[];
  systemType: DetectedSystemType;
  estimatedResonanceHz?: number;
  resonanceFrequenciesHz?: number[];
  totalSurfaceMassKgM2: number;
  leafMassesKgM2?: number[];
  cavityThicknessMm?: number;
  cavityThicknessesMm?: number[];
  hasPorousFill: boolean;
  warnings: string[];
}

export type ResolvedSoundLayer = ConstructionLayer & { material: Material };
