import type { WallAssemblyInput, WallLayer, WallSection } from '../types';

export type SectionBlock = {
  id: 'existingWall' | 'newWall';
  title: string;
  color: string;
  thicknessMm: number;
};

export type RenderLayer = WallLayer & {
  sectionId: 'existingWall' | 'newWall';
  sectionTitle: string;
  visualThicknessMm: number;
  startVisualMm: number;
  centerVisualMm: number;
};

export const visibleLayers = (layers: WallLayer[]) =>
  layers.filter((layer) => layer.visible !== false && layer.thicknessMm > 0);

export const sectionThickness = (section: WallSection) =>
  visibleLayers(section.layers).reduce((sum, layer) => sum + layer.thicknessMm, 0);

export const getSectionBlocks = (data: WallAssemblyInput): SectionBlock[] => [
  {
    id: 'existingWall',
    title: data.existingWall.title,
    color: '#aaa69e',
    thicknessMm: sectionThickness(data.existingWall),
  },
  {
    id: 'newWall',
    title: data.newWall.title,
    color: '#d4be72',
    thicknessMm: sectionThickness(data.newWall),
  },
];

export const getRenderLayers = (
  data: WallAssemblyInput,
  minVisualThicknessMm: number,
): RenderLayer[] => {
  let cursor = 0;
  const sections: Array<['existingWall' | 'newWall', WallSection]> = [
    ['existingWall', data.existingWall],
    ['newWall', data.newWall],
  ];

  return sections.flatMap(([sectionId, section]) =>
    visibleLayers(section.layers).map((layer) => {
      const visualThicknessMm = Math.max(layer.thicknessMm, minVisualThicknessMm);
      const renderLayer: RenderLayer = {
        ...layer,
        sectionId,
        sectionTitle: section.title,
        visualThicknessMm,
        startVisualMm: cursor,
        centerVisualMm: cursor + visualThicknessMm / 2,
      };
      cursor += visualThicknessMm;
      return renderLayer;
    }),
  );
};

export const totalVisibleThickness = (data: WallAssemblyInput) =>
  sectionThickness(data.existingWall) + sectionThickness(data.newWall);
