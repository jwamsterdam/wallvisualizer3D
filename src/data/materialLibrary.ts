import type { Material, WallLayer } from '../types';

type MaterialVisual = {
  color: string;
  texture?: string;
};

const defaultVisualByType: Record<Material['type'], MaterialVisual> = {
  solid_panel: { color: '#aaa69e', texture: 'concrete' },
  air_gap: { color: '#d8eef7', texture: 'air' },
  porous_fill: { color: '#d7bd63', texture: 'insulation' },
  thin_layer: { color: '#eee9df', texture: 'gypsum' },
};

const visualByMaterialId: Record<string, MaterialVisual> = {
  gipsplaat: { color: '#eee9df', texture: '/materials/gipsplaat/gipsplaat.webp' },
  osb: { color: '#b98b57', texture: '/materials/osb/osb.webp' },
  multiplex: { color: '#c79b62', texture: '/materials/multiplex/multiplex.webp' },
  mdf: { color: '#b3865c', texture: '/materials/mdf/mdf.webp' },
  glas: { color: '#d4f1f9', texture: 'air' },
  beton: { color: '#a8aaa5', texture: '/materials/beton/beton.webp' },
  kalkzandsteen: { color: '#f2f3f0', texture: '/materials/kalkzandsteen/kalkzandsteen.webp' },
  baksteen: { color: '#c45f34', texture: '/materials/baksteen/baksteen.webp' },
  luchtspouw: { color: '#d8eef7', texture: 'air' },
  steenwol: { color: '#d7bd63', texture: '/materials/steenwol/steenwol.webp' },
  glaswol: { color: '#f4d978', texture: '/materials/glaswol/glaswol.webp' },
  stucwerk: { color: '#f3f0ea', texture: '/materials/stucwerk/stucwerk.webp' },
};

export const materials: Material[] = [
  {
    id: 'gipsplaat',
    name: 'Gipsplaat',
    type: 'solid_panel',
    density: 800,
    lossFactor: 0.05,
    typicalThicknessesMm: [9.5, 12.5, 15],
    uiCategory: 'Plaatmateriaal',
    notes: 'Veelgebruikte lichte bouwplaat.',
  },
  {
    id: 'osb',
    name: 'OSB',
    type: 'solid_panel',
    density: 600,
    lossFactor: 0.06,
    typicalThicknessesMm: [9, 12, 18],
    uiCategory: 'Plaatmateriaal',
  },
  {
    id: 'multiplex',
    name: 'Multiplex',
    type: 'solid_panel',
    density: 650,
    lossFactor: 0.05,
    typicalThicknessesMm: [9, 12, 18],
    uiCategory: 'Plaatmateriaal',
  },
  {
    id: 'mdf',
    name: 'MDF',
    type: 'solid_panel',
    density: 750,
    lossFactor: 0.04,
    typicalThicknessesMm: [12, 18, 22],
    uiCategory: 'Plaatmateriaal',
  },
  {
    id: 'glas',
    name: 'Glas',
    type: 'solid_panel',
    density: 2500,
    lossFactor: 0.01,
    typicalThicknessesMm: [4, 6, 8, 10],
    uiCategory: 'Glas',
  },
  {
    id: 'beton',
    name: 'Beton',
    type: 'solid_panel',
    density: 2200,
    lossFactor: 0.02,
    typicalThicknessesMm: [100, 150, 200, 250],
    uiCategory: 'Steenachtig',
  },
  {
    id: 'kalkzandsteen',
    name: 'Kalkzandsteen',
    type: 'solid_panel',
    density: 1800,
    lossFactor: 0.03,
    typicalThicknessesMm: [100, 150, 200],
    uiCategory: 'Steenachtig',
  },
  {
    id: 'baksteen',
    name: 'Baksteen',
    type: 'solid_panel',
    density: 1700,
    lossFactor: 0.03,
    typicalThicknessesMm: [100],
    uiCategory: 'Steenachtig',
  },
  {
    id: 'luchtspouw',
    name: 'Luchtspouw',
    type: 'air_gap',
    typicalThicknessesMm: [30, 50, 70, 100],
    uiCategory: 'Spouw',
    notes: 'Werkt als veer tussen twee massieve bladen.',
  },
  {
    id: 'steenwol',
    name: 'Steenwol',
    type: 'porous_fill',
    density: 45,
    flowResistivity: 10000,
    typicalThicknessesMm: [40, 60, 70, 80],
    uiCategory: 'Porous fill',
  },
  {
    id: 'glaswol',
    name: 'Glaswol',
    type: 'porous_fill',
    density: 20,
    flowResistivity: 5000,
    typicalThicknessesMm: [40, 60, 80],
    uiCategory: 'Porous fill',
  },
  {
    id: 'stucwerk',
    name: 'Stucwerk',
    type: 'thin_layer',
    density: 1000,
    lossFactor: 0.04,
    typicalThicknessesMm: [3, 5, 10, 15],
    uiCategory: 'Dunne laag',
    notes: 'Afwerklaag die als dunne gekoppelde massa wordt meegenomen.',
  },
];

export const materialLibrary = materials;
export const materialById = new Map(materials.map((material) => [material.id, material]));

function getMaterialVisual(material: Material) {
  return visualByMaterialId[material.id] ?? defaultVisualByType[material.type];
}

export function createLayerFromMaterial(material: Material, id: string): WallLayer {
  const visual = getMaterialVisual(material);

  return {
    id,
    name: material.name,
    material: material.uiCategory,
    thicknessMm: material.typicalThicknessesMm[0] ?? 10,
    color: visual.color,
    texture: visual.texture,
    visible: true,
  };
}

export function applyMaterialToLayer(layer: WallLayer, material: Material): WallLayer {
  const visual = getMaterialVisual(material);

  return {
    ...layer,
    name: material.name,
    material: material.uiCategory,
    color: visual.color,
    texture: visual.texture,
  };
}
