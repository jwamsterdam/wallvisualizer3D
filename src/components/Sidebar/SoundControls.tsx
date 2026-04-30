import type { SoundMode, SoundWaveSettings } from '../../types';

type SoundControlsProps = {
  mode: SoundMode;
  onChange?: (mode: SoundMode) => void;
  settings: SoundWaveSettings;
  onSettingsChange?: (settings: SoundWaveSettings) => void;
};

export function SoundControls({ mode, onChange, settings, onSettingsChange }: SoundControlsProps) {
  const options: Array<{ value: SoundMode; label: string }> = [
    { value: 'off', label: 'Uit' },
    { value: 'old', label: 'Oude muur' },
    { value: 'new', label: 'Nieuwe muur' },
  ];

  return (
    <section className="sound-controls">
      <h3>Geluid visualisatie</h3>
      <div className="sound-toggle" role="group" aria-label="Geluid visualisatie">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={mode === option.value ? 'active' : ''}
            onClick={() => onChange?.(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <label className="shadow-slider">
        <span>
          Snelheid
          <strong>{settings.speed.toFixed(2)}</strong>
        </span>
        <input
          type="range"
          min={0.08}
          max={0.8}
          step={0.01}
          value={settings.speed}
          onChange={(event) =>
            onSettingsChange?.({ ...settings, speed: Number(event.currentTarget.value) })
          }
        />
      </label>
      <label className="shadow-slider">
        <span>
          Z-diepte
          <strong>{settings.depth.toFixed(1)}</strong>
        </span>
        <input
          type="range"
          min={0}
          max={8}
          step={0.1}
          value={settings.depth}
          onChange={(event) =>
            onSettingsChange?.({ ...settings, depth: Number(event.currentTarget.value) })
          }
        />
      </label>
      <label className="shadow-slider">
        <span>
          Transparantie
          <strong>{settings.opacity.toFixed(2)}</strong>
        </span>
        <input
          type="range"
          min={0.02}
          max={0.8}
          step={0.01}
          value={settings.opacity}
          onChange={(event) =>
            onSettingsChange?.({ ...settings, opacity: Number(event.currentTarget.value) })
          }
        />
      </label>
      <label className="shadow-color">
        <span>
          Kleur oude muur
          <strong>{settings.oldColor}</strong>
        </span>
        <input
          type="color"
          value={settings.oldColor}
          onChange={(event) =>
            onSettingsChange?.({ ...settings, oldColor: event.currentTarget.value })
          }
        />
      </label>
      <label className="shadow-color">
        <span>
          Kleur nieuwe muur
          <strong>{settings.newColor}</strong>
        </span>
        <input
          type="color"
          value={settings.newColor}
          onChange={(event) =>
            onSettingsChange?.({ ...settings, newColor: event.currentTarget.value })
          }
        />
      </label>
    </section>
  );
}
