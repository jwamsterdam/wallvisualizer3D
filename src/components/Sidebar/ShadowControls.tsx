import type { GroundShadowSettings } from '../../types';

type ShadowControlsProps = {
  settings: GroundShadowSettings;
  onChange?: (settings: GroundShadowSettings) => void;
};

export function ShadowControls({ settings, onChange }: ShadowControlsProps) {
  const update = (key: Exclude<keyof GroundShadowSettings, 'color'>, value: number) => {
    onChange?.({ ...settings, [key]: value });
  };

  const controls: Array<{
    key: Exclude<keyof GroundShadowSettings, 'color'>;
    label: string;
    min: number;
    max: number;
    step: number;
  }> = [
    { key: 'opacity', label: 'Donkerte', min: 0, max: 0.8, step: 0.01 },
    { key: 'xOffset', label: 'X-offset', min: -12, max: 12, step: 0.1 },
    { key: 'yOffset', label: 'Y-offset', min: -12, max: 12, step: 0.1 },
    { key: 'blur', label: 'Blur', min: 0.1, max: 24, step: 0.1 },
    { key: 'spread', label: 'Spread', min: -4, max: 12, step: 0.1 },
  ];

  return (
    <section className="shadow-controls">
      <h3>Schaduw tuning</h3>
      {controls.map((control) => (
        <label className="shadow-slider" key={control.key}>
          <span>
            {control.label}
            <strong>{settings[control.key].toFixed(control.step < 0.1 ? 2 : 1)}</strong>
          </span>
          <input
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={settings[control.key]}
            onChange={(event) => update(control.key, Number(event.currentTarget.value))}
          />
        </label>
      ))}
      <label className="shadow-color">
        <span>
          Kleur
          <strong>{settings.color}</strong>
        </span>
        <input
          type="color"
          value={settings.color}
          onChange={(event) => onChange?.({ ...settings, color: event.currentTarget.value })}
        />
      </label>
    </section>
  );
}
