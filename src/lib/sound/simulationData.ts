import type { WallAssemblyInput } from '../../types';
import { simulateConstruction } from './acoustics';
import { mapTlToPlaybackEq, normalizePlaybackMappingForAudition } from './playbackMapping';
import type { PlaybackMappingResult } from './playbackMapping';
import type { SimulationResult } from './types';
import { assemblyToSoundConstructions } from './wallAdapter';

export type WallSoundSimulationData = {
  existingResult: SimulationResult;
  nextResult: SimulationResult;
  existingAuditionMapping: PlaybackMappingResult;
  nextAuditionMapping: PlaybackMappingResult;
};

export function createWallSoundSimulationData(data?: WallAssemblyInput): WallSoundSimulationData {
  const constructions = assemblyToSoundConstructions(data);
  const existingResult = simulateConstruction(constructions.existing);
  const nextResult = simulateConstruction(constructions.next);
  const existingMapping = mapTlToPlaybackEq(existingResult);
  const nextMapping = mapTlToPlaybackEq(nextResult);

  return {
    existingResult,
    nextResult,
    existingAuditionMapping: normalizePlaybackMappingForAudition(existingMapping),
    nextAuditionMapping: normalizePlaybackMappingForAudition(nextMapping, existingMapping),
  };
}
