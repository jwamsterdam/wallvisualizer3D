import { useMemo, useState } from 'react';
import { Sidebar, SidebarTabs, type SidebarTab } from './components/Sidebar';
import { WallAssemblyViewport } from './components/WallAssemblyViewport';
import { audioSamples } from './data/audioSamples';
import { demoWall } from './data/demoWall';
import { listenModeOptions } from './data/listenModes';
import {
  applyMaterialToLayer,
  createLayerFromMaterial,
  materialLibrary,
} from './data/materialLibrary';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { createWallSoundSimulationData } from './lib/sound/simulationData';
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
  const [showLabels, setShowLabels] = useState(false);
  const [groundShadow, setGroundShadow] = useState<GroundShadowSettings>({
    opacity: 0.2,
    xOffset: -3.1,
    yOffset: 0.2,
    blur: 16.2,
    spread: -1.3,
    color: '#111111',
  });
  const [soundMode, setSoundMode] = useState<SoundMode>('source');
  const [selectedSampleId, setSelectedSampleId] = useState(audioSamples[0]?.id ?? '');
  const [autoPlayRequestId, setAutoPlayRequestId] = useState(0);
  const [soundWave, setSoundWave] = useState<SoundWaveSettings>({
    speed: 0.15,
    depth: 2.4,
    opacity: 0.8,
    oldColor: '#f59e0b',
    newColor: '#3b82f6',
  });
  const selectedSample = useMemo(
    () => audioSamples.find((sample) => sample.id === selectedSampleId) ?? audioSamples[0],
    [selectedSampleId],
  );
  const simulationData = useMemo(() => createWallSoundSimulationData(wallData), [wallData]);
  const audioPlayer = useAudioPlayer(selectedSample, {
    existingMapping: simulationData.existingAuditionMapping,
    nextMapping: simulationData.nextAuditionMapping,
    mode: soundMode,
    autoPlayRequestId,
  });

  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setAutoPlayRequestId((requestId) => requestId + 1);
  };

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
          <h1>Hoor het verschil tussen je huidige muur en een voorzetwand</h1>
        </div>
      </header>

      <div className="wall-viewer">
        <div className="canvas-shell" aria-label="3D constructiewand viewer">
          <div
            className="viewport-mini-player"
            role="group"
            aria-label="Geluid vergelijken"
          >
            <div className="viewport-player-row">
              <select
                aria-label="Geluid kiezen"
                value={selectedSampleId}
                onChange={(event) => handleSelectSample(event.currentTarget.value)}
              >
                {audioSamples.map((sample) => (
                  <option key={sample.id} value={sample.id}>
                    {sample.title}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => void audioPlayer.play()}>
                Play
              </button>
              <button type="button" onClick={audioPlayer.stop}>
                Stop
              </button>
            </div>
            <div className="viewport-listen-switch">
              {listenModeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={soundMode === option.value ? 'active' : ''}
                  onClick={() => setSoundMode(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
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
            audioPlayer={audioPlayer}
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
            onSelectSample={handleSelectSample}
            selectedSampleId={selectedSampleId}
            simulationData={simulationData}
            soundWave={soundWave}
            onSoundWaveChange={setSoundWave}
          />
        </div>
      </div>
    </main>
  );
}

export default App;
