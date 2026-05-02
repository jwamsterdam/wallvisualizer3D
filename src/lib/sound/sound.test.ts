import { describe, expect, it } from 'vitest';
import { demoWall } from '../../data/demoWall';
import { simulateConstruction } from './acoustics';
import { designFirFilter } from './fir';
import { mapTlToPlaybackEq, normalizePlaybackMappingForAudition } from './playbackMapping';
import { assemblyToSoundConstructions } from './wallAdapter';
import type { ConstructionLayer } from './types';

function playbackLoss(layers: ConstructionLayer[]) {
  return mapTlToPlaybackEq(simulateConstruction(layers)).playbackBroadbandLossDb;
}

describe('sound simulation tuning', () => {
  it('adapts visible wall layers without mutating builder data', () => {
    const constructions = assemblyToSoundConstructions(demoWall);

    expect(constructions.existing.map((layer) => layer.materialId)).toEqual(['kalkzandsteen']);
    expect(constructions.next.map((layer) => layer.materialId)).toEqual([
      'kalkzandsteen',
      'luchtspouw',
      'steenwol',
      'gipsplaat',
      'gipsplaat',
    ]);
  });

  it('keeps tuned playback ordering for common constructions', () => {
    const singleGypsum = playbackLoss([{ id: 'v1', materialId: 'gipsplaat', thicknessMm: 12.5 }]);
    const osbGypsum = playbackLoss([
      { id: 'v1', materialId: 'osb', thicknessMm: 12 },
      { id: 'v2', materialId: 'gipsplaat', thicknessMm: 12.5 },
    ]);
    const filledCavity = playbackLoss([
      { id: 'v1', materialId: 'gipsplaat', thicknessMm: 12.5 },
      { id: 'v2', materialId: 'luchtspouw', thicknessMm: 70 },
      { id: 'v3', materialId: 'steenwol', thicknessMm: 70 },
      { id: 'v4', materialId: 'gipsplaat', thicknessMm: 12.5 },
    ]);
    const concrete = playbackLoss([{ id: 'v1', materialId: 'beton', thicknessMm: 200 }]);

    expect(singleGypsum).toBeGreaterThanOrEqual(10);
    expect(singleGypsum).toBeLessThanOrEqual(18);
    expect(osbGypsum).toBeGreaterThan(singleGypsum);
    expect(filledCavity).toBeGreaterThan(osbGypsum);
    expect(concrete).toBeGreaterThan(filledCavity);
  });

  it('designs an FIR filter within the expected tuning tolerance', () => {
    const simulation = simulateConstruction([
      { id: 'v1', materialId: 'gipsplaat', thicknessMm: 12.5 },
      { id: 'v2', materialId: 'luchtspouw', thicknessMm: 70 },
      { id: 'v3', materialId: 'steenwol', thicknessMm: 70 },
      { id: 'v4', materialId: 'gipsplaat', thicknessMm: 12.5 },
    ]);
    const mapping = normalizePlaybackMappingForAudition(mapTlToPlaybackEq(simulation));
    const fir = designFirFilter(mapping, 48000, 128);
    const maxErrorDb = Math.max(...fir.bandChecks.map((check) => Math.abs(check.errorDb)));

    expect(fir.impulseLength % 2).toBe(1);
    expect(maxErrorDb).toBeLessThanOrEqual(4);
  });
});
