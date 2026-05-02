import { materialLibrary } from '../../data/materialLibrary';
import type { WallAssemblyInput, WallLayer } from '../../types';
import { visibleLayers } from '../wallGeometry';
import type { ConstructionLayer } from './types';

function materialIdForWallLayer(layer: WallLayer) {
  return materialLibrary.find(
    (material) => material.name === layer.name && material.uiCategory === layer.material,
  )?.id;
}

export function wallLayersToConstructionLayers(layers: WallLayer[]): ConstructionLayer[] {
  return visibleLayers(layers).flatMap((layer) => {
    const materialId = materialIdForWallLayer(layer);

    if (!materialId) {
      return [];
    }

    return {
      id: layer.id,
      materialId,
      thicknessMm: layer.thicknessMm,
    };
  });
}

export function assemblyToSoundConstructions(data?: WallAssemblyInput) {
  return {
    existing: wallLayersToConstructionLayers(data?.existingWall.layers ?? []),
    next: wallLayersToConstructionLayers(data?.newWall.layers ?? []),
  };
}
