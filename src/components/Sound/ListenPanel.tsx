import { useMemo, useState } from 'react';
import { audioSamples } from '../../data/audioSamples';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { simulateConstruction } from '../../lib/sound/acoustics';
import { mapTlToPlaybackEq, normalizePlaybackMappingForAudition } from '../../lib/sound/playbackMapping';
import { assemblyToSoundConstructions } from '../../lib/sound/wallAdapter';
import type { ListenMode, WallAssemblyInput } from '../../types';
import { AudioSamplePicker } from './AudioSamplePicker';
import { AudioTransportControls } from './AudioTransportControls';
import { ComparableVolumeControl } from './ComparableVolumeControl';
import { ListenModeControl } from './ListenModeControl';

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
  const playbackMappings = useMemo(() => {
    const constructions = assemblyToSoundConstructions(data);
    const existingMapping = mapTlToPlaybackEq(simulateConstruction(constructions.existing));
    const nextMapping = mapTlToPlaybackEq(simulateConstruction(constructions.next));

    return {
      existing: normalizePlaybackMappingForAudition(existingMapping),
      next: normalizePlaybackMappingForAudition(nextMapping, existingMapping),
    };
  }, [data]);
  const player = useAudioPlayer(selectedSample, {
    existingMapping: playbackMappings.existing,
    nextMapping: playbackMappings.next,
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
    </div>
  );
}
