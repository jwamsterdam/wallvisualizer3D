import { formatAudioTime } from '../../lib/audio/player';

type AudioTransportControlsProps = {
  isPlaying: boolean;
  position: number;
  duration: number;
  onPlay: () => void;
  onStop: () => void;
  onRestart: () => void;
};

export function AudioTransportControls({
  isPlaying,
  position,
  duration,
  onPlay,
  onStop,
  onRestart,
}: AudioTransportControlsProps) {
  const progress = duration > 0 ? Math.min(Math.max(position / duration, 0), 1) : 0;

  return (
    <div className="audio-transport">
      <div className="audio-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
      <div className="audio-time">
        <span>{formatAudioTime(position)}</span>
        <span>{duration > 0 ? formatAudioTime(duration) : '--:--'}</span>
      </div>
      <div className="audio-buttons">
        <button type="button" onClick={isPlaying ? onStop : onPlay}>
          {isPlaying ? 'Stop' : 'Afspelen'}
        </button>
        <button type="button" onClick={onRestart}>
          Opnieuw
        </button>
      </div>
    </div>
  );
}
