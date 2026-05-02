import type {
  GroundShadowSettings,
  MaterialDefinition,
  SoundMode,
  SoundWaveSettings,
  WallAssemblyInput,
  WallLayer,
} from '../../types';
import { ComposerPanel } from './ComposerPanel';
import { SettingsPanel } from './SettingsPanel';
import { ListenPanel } from '../Sound';
import type { SidebarTab } from './types';

export type SidebarProps = {
  data?: WallAssemblyInput;
  activeTab: SidebarTab;
  materials: MaterialDefinition[];
  showLabels: boolean;
  onShowLabelsChange?: (showLabels: boolean) => void;
  onAddLayer?: (sectionKey: keyof WallAssemblyInput, materialId: string) => void;
  onChangeLayerMaterial?: (
    sectionKey: keyof WallAssemblyInput,
    layerId: string,
    materialId: string,
  ) => void;
  onUpdateLayer?: (
    sectionKey: keyof WallAssemblyInput,
    layerId: string,
    patch: Partial<Pick<WallLayer, 'thicknessMm'>>,
  ) => void;
  onRemoveLayer?: (sectionKey: keyof WallAssemblyInput, layerId: string) => void;
  onMoveLayer?: (sectionKey: keyof WallAssemblyInput, fromIndex: number, toIndex: number) => void;
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
  materials,
  showLabels,
  onShowLabelsChange,
  onAddLayer,
  onChangeLayerMaterial,
  onUpdateLayer,
  onRemoveLayer,
  onMoveLayer,
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
      {activeTab === 'composer' ? (
        <ComposerPanel
          data={data}
          materials={materials}
          onAddLayer={onAddLayer}
          onChangeLayerMaterial={onChangeLayerMaterial}
          onUpdateLayer={onUpdateLayer}
          onRemoveLayer={onRemoveLayer}
          onMoveLayer={onMoveLayer}
        />
      ) : null}
      {activeTab === 'simulator' ? (
        <ListenPanel
          data={data}
          listenMode={soundMode}
          onListenModeChange={onSoundModeChange}
          soundWave={soundWave}
        />
      ) : null}
    </aside>
  );
}
