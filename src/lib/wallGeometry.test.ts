import { describe, expect, it } from 'vitest';
import type { WallAssemblyInput, WallLayer } from '../types';
import {
  getRenderLayers,
  getSectionBlocks,
  sectionThickness,
  totalVisibleThickness,
  visibleLayers,
} from './wallGeometry';

const layer = (overrides: Partial<WallLayer> & Pick<WallLayer, 'id' | 'thicknessMm'>): WallLayer => ({
  id: overrides.id,
  name: overrides.name ?? overrides.id,
  material: overrides.material ?? 'Test',
  thicknessMm: overrides.thicknessMm,
  color: overrides.color ?? '#ffffff',
  texture: overrides.texture,
  visible: overrides.visible,
});

const data: WallAssemblyInput = {
  existingWall: {
    title: 'Oude muur',
    layers: [
      layer({ id: 'brick', name: 'Kalkzandsteen', thicknessMm: 100 }),
      layer({ id: 'hidden-old', thicknessMm: 45, visible: false }),
      layer({ id: 'zero-old', thicknessMm: 0 }),
    ],
  },
  newWall: {
    title: 'Nieuwe muur',
    layers: [
      layer({ id: 'air', name: 'Luchtspouw', thicknessMm: 70 }),
      layer({ id: 'gypsum', name: 'Gipsplaat', thicknessMm: 12.5 }),
    ],
  },
};

describe('wallGeometry', () => {
  it('filters invisible and zero-thickness layers', () => {
    expect(visibleLayers(data.existingWall.layers).map((item) => item.id)).toEqual(['brick']);
  });

  it('calculates section and total visible thickness from real thicknesses', () => {
    expect(sectionThickness(data.existingWall)).toBe(100);
    expect(sectionThickness(data.newWall)).toBe(82.5);
    expect(totalVisibleThickness(data)).toBe(182.5);
  });

  it('builds section block summaries', () => {
    expect(getSectionBlocks(data)).toEqual([
      {
        id: 'existingWall',
        title: 'Oude muur',
        color: '#aaa69e',
        thicknessMm: 100,
      },
      {
        id: 'newWall',
        title: 'Nieuwe muur',
        color: '#d4be72',
        thicknessMm: 82.5,
      },
    ]);
  });

  it('applies minimum visual thickness while preserving real layer data', () => {
    const layers = getRenderLayers(data, 24);

    expect(layers.map((item) => item.id)).toEqual(['brick', 'air', 'gypsum']);
    expect(layers.map((item) => item.thicknessMm)).toEqual([100, 70, 12.5]);
    expect(layers.map((item) => item.visualThicknessMm)).toEqual([100, 70, 24]);
  });

  it('positions render layers cumulatively by visual thickness', () => {
    const layers = getRenderLayers(data, 24);

    expect(
      layers.map((item) => ({
        id: item.id,
        startVisualMm: item.startVisualMm,
        centerVisualMm: item.centerVisualMm,
      })),
    ).toEqual([
      { id: 'brick', startVisualMm: 0, centerVisualMm: 50 },
      { id: 'air', startVisualMm: 100, centerVisualMm: 135 },
      { id: 'gypsum', startVisualMm: 170, centerVisualMm: 182 },
    ]);
  });
});
