import { useMemo, useState } from 'react';
import { audioSamples } from '../../data/audioSamples';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { simulateConstruction } from '../../lib/sound/acoustics';
import { designFirFilter } from '../../lib/sound/fir';
import { mapTlToPlaybackEq, normalizePlaybackMappingForAudition } from '../../lib/sound/playbackMapping';
import { assemblyToSoundConstructions } from '../../lib/sound/wallAdapter';
import type { ListenMode, WallAssemblyInput } from '../../types';
import { AudioSamplePicker } from './AudioSamplePicker';
import { AudioTransportControls } from './AudioTransportControls';
import { ComparableVolumeControl } from './ComparableVolumeControl';
import { ListenModeControl } from './ListenModeControl';
import { PlaybackDebugPanel } from './PlaybackDebugPanel';
import { SoundEqDisplay } from './SoundEqDisplay';

type ListenPanelProps = {
  data?: WallAssemblyInput;
  listenMode: ListenMode;
  onListenModeChange?: (mode: ListenMode) => void;
};

export function ListenPanel({ data, listenMode, onListenModeChange }: ListenPanelProps) {
  const [selectedSampleId, setSelectedSampleId] = useState(audioSamples[0]?.id ?? '');
  const selectedSample = useMemo(
    () => audioSamples.find((sample) => sample.id === selectedSampleId) ?? audioSamples[0],
    [selectedSampleId],
  );
  const simulationData = useMemo(() => {
    const constructions = assemblyToSoundConstructions(data);
    const existingResult = simulateConstruction(constructions.existing);
    const nextResult = simulateConstruction(constructions.next);
    const existingMapping = mapTlToPlaybackEq(existingResult);
    const nextMapping = mapTlToPlaybackEq(nextResult);

    return {
      existingResult,
      nextResult,
      existingAuditionMapping: normalizePlaybackMappingForAudition(existingMapping),
      nextAuditionMapping: normalizePlaybackMappingForAudition(nextMapping, existingMapping),
    };
  }, [data]);
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
  const player = useAudioPlayer(selectedSample, {
    existingMapping: simulationData.existingAuditionMapping,
    nextMapping: simulationData.nextAuditionMapping,
    mode: listenMode,
  });

  return (
    <div className="sidebar-tab-panel listen-panel" role="tabpanel" aria-label="Luisteren">
      <section className="listen-section">
        <h3>Muziek kiezen</h3>
        <AudioSamplePicker
          samples={audioSamples}
          selectedSampleId={selectedSample.id}
          onSelectSample={setSelectedSampleId}
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
          isPlaying={player.isPlaying}
          position={player.position}
          duration={player.duration}
          onPlay={() => void player.play()}
          onStop={player.stop}
          onRestart={() => void player.restart()}
        />
        <ComparableVolumeControl volume={player.volume} onVolumeChange={player.setVolume} />
      </section>

      <section className="listen-section listen-section--muted">
        <h3>Constructie</h3>
        <p>De luisterstand gebruikt vergelijkbaar volume; de constructie verandert alleen de klankkleur.</p>
      </section>

      <SoundEqDisplay
        existingBands={simulationData.existingResult.bands}
        nextBands={simulationData.nextResult.bands}
        playbackMapping={inspectedPlaybackMapping}
      />

      <PlaybackDebugPanel
        result={inspectedResult}
        playbackMapping={inspectedPlaybackMapping}
        firDesign={firDesign}
      />
    </div>
  );
}
