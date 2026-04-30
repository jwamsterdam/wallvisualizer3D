import { useState } from 'react';
import { Sidebar, SidebarTabs, type SidebarTab } from './components/Sidebar';
import { WallAssemblyViewport } from './components/WallAssemblyViewport';
import { demoWall } from './data/demoWall';
import type { GroundShadowSettings, SoundMode, SoundWaveSettings } from './types';

function App() {
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
  const [soundMode, setSoundMode] = useState<SoundMode>('off');
  const [soundWave, setSoundWave] = useState<SoundWaveSettings>({
    speed: 0.15,
    depth: 2.4,
    opacity: 0.8,
    oldColor: '#f59e0b',
    newColor: '#3b82f6',
  });

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Constructiewand viewer</p>
          <h1>3D wandopbouw</h1>
        </div>
      </header>

      <div className="wall-viewer">
        <div className="canvas-shell" aria-label="3D constructiewand viewer">
          <WallAssemblyViewport
            data={demoWall}
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
            data={demoWall}
            activeTab={activeTab}
            showLabels={showLabels}
            onShowLabelsChange={setShowLabels}
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
