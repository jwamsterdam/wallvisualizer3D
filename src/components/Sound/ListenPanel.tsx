import { useMemo, useState } from 'react';
import { audioSamples } from '../../data/audioSamples';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { AudioSamplePicker } from './AudioSamplePicker';
import { AudioTransportControls } from './AudioTransportControls';
import { ComparableVolumeControl } from './ComparableVolumeControl';

export function ListenPanel() {
  const [selectedSampleId, setSelectedSampleId] = useState(audioSamples[0]?.id ?? '');
  const selectedSample = useMemo(
    () => audioSamples.find((sample) => sample.id === selectedSampleId) ?? audioSamples[0],
    [selectedSampleId],
  );
  const player = useAudioPlayer(selectedSample);

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
        <p>Door de huidige of nieuwe muur luisteren komt in de volgende stap.</p>
      </section>
    </div>
  );
}
