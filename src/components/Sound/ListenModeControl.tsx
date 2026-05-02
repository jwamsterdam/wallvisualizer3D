import { listenModeOptions } from '../../data/listenModes';
import type { ListenMode } from '../../types';

type ListenModeControlProps = {
  mode: ListenMode;
  onModeChange: (mode: ListenMode) => void;
};

export function ListenModeControl({ mode, onModeChange }: ListenModeControlProps) {
  return (
    <div className="listen-mode-toggle" role="group" aria-label="Luisterstand">
      {listenModeOptions.map((item) => (
        <button
          key={item.value}
          type="button"
          className={mode === item.value ? 'active' : ''}
          onClick={() => onModeChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
