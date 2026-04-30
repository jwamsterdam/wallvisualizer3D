import type { MaterialDefinition, WallLayer } from '../types';

export const materialLibrary: MaterialDefinition[] = [
  {
    id: 'calcium-silicate',
    name: 'Kalkzandsteen',
    material: 'Steenachtig',
    defaultThicknessMm: 100,
    color: '#aaa69e',
    texture: 'concrete',
  },
  {
    id: 'air-gap',
    name: 'Luchtspouw',
    material: 'Spouw',
    defaultThicknessMm: 70,
    color: '#d8eef7',
    texture: 'air',
  },
  {
    id: 'stone-wool-medium',
    name: 'Steenwol middel',
    material: 'Porous fill',
    defaultThicknessMm: 70,
    color: '#d7bd63',
    texture: 'insulation',
  },
  {
    id: 'gypsum-board',
    name: 'Gipsplaat',
    material: 'Plaatmateriaal',
    defaultThicknessMm: 12.5,
    color: '#eee9df',
    texture: 'gypsum',
  },
];

export function createLayerFromMaterial(material: MaterialDefinition, id: string): WallLayer {
  return {
    id,
    name: material.name,
    material: material.material,
    thicknessMm: material.defaultThicknessMm,
    color: material.color,
    texture: material.texture,
    visible: true,
  };
}

export function applyMaterialToLayer(layer: WallLayer, material: MaterialDefinition): WallLayer {
  return {
    ...layer,
    name: material.name,
    material: material.material,
    color: material.color,
    texture: material.texture,
  };
}
