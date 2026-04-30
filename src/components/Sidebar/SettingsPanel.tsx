import type { GroundShadowSettings, SoundMode, SoundWaveSettings } from '../../types';
import { DisplayControls } from './DisplayControls';
import { ShadowControls } from './ShadowControls';
import { SoundControls } from './SoundControls';

type SettingsPanelProps = {
  showLabels: boolean;
  onShowLabelsChange?: (showLabels: boolean) => void;
  groundShadow: GroundShadowSettings;
  onGroundShadowChange?: (settings: GroundShadowSettings) => void;
  soundMode: SoundMode;
  onSoundModeChange?: (mode: SoundMode) => void;
  soundWave: SoundWaveSettings;
  onSoundWaveChange?: (settings: SoundWaveSettings) => void;
};

export function SettingsPanel({
  showLabels,
  onShowLabelsChange,
  groundShadow,
  onGroundShadowChange,
  soundMode,
  onSoundModeChange,
  soundWave,
  onSoundWaveChange,
}: SettingsPanelProps) {
  return (
    <div className="sidebar-tab-panel" role="tabpanel">
      <DisplayControls showLabels={showLabels} onShowLabelsChange={onShowLabelsChange} />
      <SoundControls
        mode={soundMode}
        onChange={onSoundModeChange}
        settings={soundWave}
        onSettingsChange={onSoundWaveChange}
      />
      <ShadowControls settings={groundShadow} onChange={onGroundShadowChange} />
    </div>
  );
}
