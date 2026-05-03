import { useMemo } from 'react';
import { audioSamples } from '../../data/audioSamples';
import type { AudioPlayerControls } from '../../hooks/useAudioPlayer';
import { designFirFilter } from '../../lib/sound/fir';
import type { WallSoundSimulationData } from '../../lib/sound/simulationData';
import type { ListenMode, SoundWaveSettings } from '../../types';
import { AudioSamplePicker } from './AudioSamplePicker';
import { AudioTransportControls } from './AudioTransportControls';
import { ComparableVolumeControl } from './ComparableVolumeControl';
import { ListenModeControl } from './ListenModeControl';
import { PlaybackDebugPanel } from './PlaybackDebugPanel';
import { SoundEqDisplay } from './SoundEqDisplay';

type ListenPanelProps = {
  audioPlayer: AudioPlayerControls;
  listenMode: ListenMode;
  onListenModeChange?: (mode: ListenMode) => void;
  onSelectSample: (sampleId: string) => void;
  selectedSampleId: string;
  simulationData: WallSoundSimulationData;
  soundWave: SoundWaveSettings;
};

export function ListenPanel({
  audioPlayer,
  listenMode,
  onListenModeChange,
  onSelectSample,
  selectedSampleId,
  simulationData,
  soundWave,
}: ListenPanelProps) {
  const inspectedResult =
    listenMode === 'new' ? simulationData.nextResult : simulationData.existingResult;
  const inspectedPlaybackMapping =
    listenMode === 'new'
      ? simulationData.nextAuditionMapping
      : simulationData.existingAuditionMapping;
  const firDesign = useMemo(
    () => designFirFilter(inspectedPlaybackMapping, 48000, 129),
    [inspectedPlaybackMapping],
  );

  return (
    <div className="sidebar-tab-panel listen-panel" role="tabpanel" aria-label="Luisteren">
      <section className="listen-section">
        <h3>Muziek kiezen</h3>
        <AudioSamplePicker
          samples={audioSamples}
          selectedSampleId={selectedSampleId}
          onSelectSample={onSelectSample}
        />
      </section>

      <section className="listen-section">
        <h3>Afspelen</h3>
        <ListenModeControl
          mode={listenMode}
          onModeChange={(mode) => {
            onListenModeChange?.(mode);
          }}
        />
        <AudioTransportControls
          isPlaying={audioPlayer.isPlaying}
          position={audioPlayer.position}
          duration={audioPlayer.duration}
          onPlay={() => void audioPlayer.play()}
          onStop={audioPlayer.stop}
          onRestart={() => void audioPlayer.restart()}
        />
        <ComparableVolumeControl
          volume={audioPlayer.volume}
          onVolumeChange={audioPlayer.setVolume}
        />
      </section>

      <section className="listen-section listen-section--muted">
        <h3>Constructie</h3>
        <p>De luisterstand gebruikt vergelijkbaar volume; de constructie verandert alleen de klankkleur.</p>
      </section>

      <SoundEqDisplay
        existingBands={simulationData.existingResult.bands}
        nextBands={simulationData.nextResult.bands}
        playbackMapping={inspectedPlaybackMapping}
        colors={soundWave}
      />

      <PlaybackDebugPanel
        result={inspectedResult}
        playbackMapping={inspectedPlaybackMapping}
        firDesign={firDesign}
      />
    </div>
  );
}
