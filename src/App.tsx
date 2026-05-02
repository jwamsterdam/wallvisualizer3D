import { useState } from 'react';
import { Sidebar, SidebarTabs, type SidebarTab } from './components/Sidebar';
import { WallAssemblyViewport } from './components/WallAssemblyViewport';
import { demoWall } from './data/demoWall';
import {
  applyMaterialToLayer,
  createLayerFromMaterial,
  materialLibrary,
} from './data/materialLibrary';
import type {
  GroundShadowSettings,
  MaterialDefinition,
  SoundMode,
  SoundWaveSettings,
  WallAssemblyInput,
  WallLayer,
} from './types';

type WallSectionKey = keyof WallAssemblyInput;

function createLayerId(sectionKey: WallSectionKey, material: MaterialDefinition) {
  return `${sectionKey}-${material.id}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

function App() {
  const [wallData, setWallData] = useState<WallAssemblyInput>(demoWall);
  const [activeTab, setActiveTab] = useState<SidebarTab>('composer');
  const [showLabels, setShowLabels] = useState(true);
  const [groundShadow, setGroundShadow] = useState<GroundShadowSettings>({
    opacity: 0.2,
    xOffset: -3.1,
    yOffset: 0.2,
    blur: 16.2,
    spread: -1.3,
    color: '#111111',
  });
  const [soundMode, setSoundMode] = useState<SoundMode>('source');
  const [soundWave, setSoundWave] = useState<SoundWaveSettings>({
    speed: 0.15,
    depth: 2.4,
    opacity: 0.8,
    oldColor: '#f59e0b',
    newColor: '#3b82f6',
  });

  const updateSectionLayers = (
    sectionKey: WallSectionKey,
    updater: (layers: WallLayer[]) => WallLayer[],
  ) => {
    setWallData((currentData) => ({
      ...currentData,
      [sectionKey]: {
        ...currentData[sectionKey],
        layers: updater(currentData[sectionKey].layers),
      },
    }));
  };

  const handleAddLayer = (sectionKey: WallSectionKey, materialId: string) => {
    const material = materialLibrary.find((item) => item.id === materialId) ?? materialLibrary[0];
    updateSectionLayers(sectionKey, (layers) => [
      ...layers,
      createLayerFromMaterial(material, createLayerId(sectionKey, material)),
    ]);
  };

  const handleUpdateLayer = (
    sectionKey: WallSectionKey,
    layerId: string,
    patch: Partial<Pick<WallLayer, 'thicknessMm'>>,
  ) => {
    updateSectionLayers(sectionKey, (layers) =>
      layers.map((layer) => (layer.id === layerId ? { ...layer, ...patch } : layer)),
    );
  };

  const handleChangeLayerMaterial = (
    sectionKey: WallSectionKey,
    layerId: string,
    materialId: string,
  ) => {
    const material = materialLibrary.find((item) => item.id === materialId);

    if (!material) {
      return;
    }

    updateSectionLayers(sectionKey, (layers) =>
      layers.map((layer) => (layer.id === layerId ? applyMaterialToLayer(layer, material) : layer)),
    );
  };

  const handleRemoveLayer = (sectionKey: WallSectionKey, layerId: string) => {
    updateSectionLayers(sectionKey, (layers) => layers.filter((layer) => layer.id !== layerId));
  };

  const handleMoveLayer = (sectionKey: WallSectionKey, fromIndex: number, toIndex: number) => {
    updateSectionLayers(sectionKey, (layers) => {
      const dropIndex = Math.max(0, Math.min(toIndex, layers.length));
      const clampedToIndex = fromIndex < dropIndex ? dropIndex - 1 : dropIndex;

      if (fromIndex === clampedToIndex) {
        return layers;
      }

      return moveItem(layers, fromIndex, clampedToIndex);
    });
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-title">
          <p className="eyebrow">Last van je buren?</p>
          <h1>Hoor hoe het klinkt met een voorzetwand</h1>
        </div>
      </header>

      <div className="wall-viewer">
        <div className="canvas-shell" aria-label="3D constructiewand viewer">
          <WallAssemblyViewport
            data={wallData}
            widthMm={6000}
            heightMm={2800}
            showLabels={showLabels}
            minVisualThicknessMm={24}
            groundShadow={groundShadow}
            soundMode={soundMode}
            onSoundModeChange={setSoundMode}
            soundWave={soundWave}
          />
        </div>
        <div className="sidebar-shell">
          <SidebarTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <Sidebar
            data={wallData}
            activeTab={activeTab}
            materials={materialLibrary}
            showLabels={showLabels}
            onShowLabelsChange={setShowLabels}
            onAddLayer={handleAddLayer}
            onChangeLayerMaterial={handleChangeLayerMaterial}
            onUpdateLayer={handleUpdateLayer}
            onRemoveLayer={handleRemoveLayer}
            onMoveLayer={handleMoveLayer}
            groundShadow={groundShadow}
            onGroundShadowChange={setGroundShadow}
            soundMode={soundMode}
            onSoundModeChange={setSoundMode}
            soundWave={soundWave}
            onSoundWaveChange={setSoundWave}
          />
        </div>
      </div>
    </main>
  );
}

export default App;
