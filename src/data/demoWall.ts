import type { WallAssemblyInput } from '../types';

export const demoWall: WallAssemblyInput = {
  existingWall: {
    title: 'Oude muur',
    layers: [
      {
        id: 'existing-1',
        name: 'Kalkzandsteen',
        material: 'Steenachtig',
        thicknessMm: 100,
        color: '#aaa69e',
        texture: 'concrete',
        visible: true,
      },
    ],
  },
  newWall: {
    title: 'Nieuwe muur met voorzetwand',
    layers: [
      {
        id: 'air-gap-1',
        name: 'Luchtspouw',
        material: 'Spouw',
        thicknessMm: 70,
        color: '#d8eef7',
        texture: 'air',
        visible: true,
      },
      {
        id: 'insulation-1',
        name: 'Steenwol middel',
        material: 'Porous fill',
        thicknessMm: 70,
        color: '#d7bd63',
        texture: 'insulation',
        visible: true,
      },
      {
        id: 'gypsum-1',
        name: 'Gipsplaat',
        material: 'Plaatmateriaal',
        thicknessMm: 12.5,
        color: '#eee9df',
        texture: 'gypsum',
        visible: true,
      },
      {
        id: 'gypsum-2',
        name: 'Gipsplaat',
        material: 'Plaatmateriaal',
        thicknessMm: 12.5,
        color: '#eee9df',
        texture: 'gypsum',
        visible: true,
      },
    ],
  },
};
