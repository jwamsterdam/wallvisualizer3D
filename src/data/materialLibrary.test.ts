import { describe, expect, it } from 'vitest';
import {
  applyMaterialToLayer,
  createLayerFromMaterial,
  materialById,
  materialLibrary,
  materials,
} from './materialLibrary';

describe('materialLibrary', () => {
  it('contains built-in materials for the wall composer', () => {
    expect(materials).toHaveLength(12);
    expect(materialLibrary.map((material) => material.id)).toContain('kalkzandsteen');
    expect(materialLibrary.map((material) => material.id)).toContain('beton');
    expect(materialLibrary.map((material) => material.id)).toContain('steenwol');
    expect(materialLibrary.map((material) => material.id)).not.toContain('beton-licht');
    expect(materialLibrary.map((material) => material.id)).not.toContain('steenwol-middel');
    expect(materialById.get('gipsplaat')?.typicalThicknessesMm).toEqual([9.5, 12.5, 15]);
  });

  it('creates a visible wall layer from a material definition', () => {
    const material = materialLibrary.find((item) => item.id === 'gipsplaat');

    expect(material).toBeDefined();
    expect(createLayerFromMaterial(material!, 'layer-1')).toEqual({
      id: 'layer-1',
      name: 'Gipsplaat',
      material: 'Plaatmateriaal',
      thicknessMm: 9.5,
      color: '#eee9df',
      texture: '/materials/gipsplaat/gipsplaat.webp',
      visible: true,
    });
  });

  it('changes material display data while preserving custom thickness', () => {
    const layer = createLayerFromMaterial(materialById.get('kalkzandsteen')!, 'layer-1');
    const changedLayer = applyMaterialToLayer({ ...layer, thicknessMm: 88 }, materialById.get('luchtspouw')!);

    expect(changedLayer).toMatchObject({
      id: 'layer-1',
      name: 'Luchtspouw',
      material: 'Spouw',
      thicknessMm: 88,
      color: '#d8eef7',
      texture: 'air',
    });
  });

  it('uses webp texture pairs for image-backed materials', () => {
    const imageMaterials = materialLibrary
      .map((material) => createLayerFromMaterial(material, material.id))
      .filter((layer) => layer.texture?.startsWith('/materials/'));

    expect(imageMaterials.length).toBeGreaterThan(0);

    for (const layer of imageMaterials) {
      expect(layer.texture).toMatch(/\.webp$/);

      const normalPath = layer.texture!.replace(/\/([^/]+)\.webp$/, '/$1-normal.webp');
      expect(normalPath).toMatch(/\/materials\/[^/]+\/[^/]+-normal\.webp$/);
    }
  });
});
