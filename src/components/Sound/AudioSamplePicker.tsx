import type { AudioSample } from '../../data/audioSamples';

type AudioSamplePickerProps = {
  samples: AudioSample[];
  selectedSampleId: string;
  onSelectSample: (sampleId: string) => void;
};

export function AudioSamplePicker({
  samples,
  selectedSampleId,
  onSelectSample,
}: AudioSamplePickerProps) {
  return (
    <div className="audio-sample-list" role="radiogroup" aria-label="Muziek kiezen">
      {samples.map((sample) => (
        <button
          key={sample.id}
          type="button"
          className={sample.id === selectedSampleId ? 'active' : ''}
          role="radio"
          aria-checked={sample.id === selectedSampleId}
          onClick={() => onSelectSample(sample.id)}
        >
          <span>
            <strong>{sample.title}</strong>
            <em>{sample.description}</em>
          </span>
          <small>{sample.category}</small>
        </button>
      ))}
    </div>
  );
}
