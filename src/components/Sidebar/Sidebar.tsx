import type {
  GroundShadowSettings,
  SoundMode,
  SoundWaveSettings,
  WallAssemblyInput,
} from '../../types';
import { ComposerPanel } from './ComposerPanel';
import { SettingsPanel } from './SettingsPanel';
import { SimulatorPanel } from './SimulatorPanel';
import type { SidebarTab } from './types';

export type SidebarProps = {
  data?: WallAssemblyInput;
  activeTab: SidebarTab;
  showLabels: boolean;
  onShowLabelsChange?: (showLabels: boolean) => void;
  groundShadow: GroundShadowSettings;
  onGroundShadowChange?: (settings: GroundShadowSettings) => void;
  soundMode: SoundMode;
  onSoundModeChange?: (mode: SoundMode) => void;
  soundWave: SoundWaveSettings;
  onSoundWaveChange?: (settings: SoundWaveSettings) => void;
};

export function Sidebar({
  data,
  activeTab,
  showLabels,
  onShowLabelsChange,
  groundShadow,
  onGroundShadowChange,
  soundMode,
  onSoundModeChange,
  soundWave,
  onSoundWaveChange,
}: SidebarProps) {
  return (
    <aside className="legend-panel">
      {activeTab === 'settings' ? (
        <SettingsPanel
          showLabels={showLabels}
          onShowLabelsChange={onShowLabelsChange}
          groundShadow={groundShadow}
          onGroundShadowChange={onGroundShadowChange}
          soundMode={soundMode}
          onSoundModeChange={onSoundModeChange}
          soundWave={soundWave}
          onSoundWaveChange={onSoundWaveChange}
        />
      ) : null}
      {activeTab === 'composer' ? <ComposerPanel data={data} /> : null}
      {activeTab === 'simulator' ? <SimulatorPanel /> : null}
    </aside>
  );
}
