import { describe, expect, it } from 'vitest';
import { applyMaterialToLayer, createLayerFromMaterial, materialLibrary } from './materialLibrary';

describe('materialLibrary', () => {
  it('contains built-in materials for the wall composer', () => {
    expect(materialLibrary.map((material) => material.id)).toEqual([
      'calcium-silicate',
      'air-gap',
      'stone-wool-medium',
      'gypsum-board',
    ]);
  });

  it('creates a visible wall layer from a material definition', () => {
    const material = materialLibrary.find((item) => item.id === 'gypsum-board');

    expect(material).toBeDefined();
    expect(createLayerFromMaterial(material!, 'layer-1')).toEqual({
      id: 'layer-1',
      name: 'Gipsplaat',
      material: 'Plaatmateriaal',
      thicknessMm: 12.5,
      color: '#eee9df',
      texture: 'gypsum',
      visible: true,
    });
  });

  it('changes material display data while preserving custom thickness', () => {
    const layer = createLayerFromMaterial(materialLibrary[0], 'layer-1');
    const changedLayer = applyMaterialToLayer({ ...layer, thicknessMm: 88 }, materialLibrary[1]);

    expect(changedLayer).toMatchObject({
      id: 'layer-1',
      name: 'Luchtspouw',
      material: 'Spouw',
      thicknessMm: 88,
      color: '#d8eef7',
      texture: 'air',
    });
  });
});
