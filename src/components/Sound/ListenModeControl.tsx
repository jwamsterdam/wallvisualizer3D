import type { ListenMode } from '../../lib/sound/types';

type ListenModeControlProps = {
  mode: ListenMode;
  onModeChange: (mode: ListenMode) => void;
};

const modes: Array<{ id: ListenMode; label: string }> = [
  { id: 'source', label: 'Bron' },
  { id: 'existing', label: 'Huidige muur' },
  { id: 'new', label: 'Nieuwe muur' },
];

export function ListenModeControl({ mode, onModeChange }: ListenModeControlProps) {
  return (
    <div className="listen-mode-toggle" role="group" aria-label="Luisterstand">
      {modes.map((item) => (
        <button
          key={item.id}
          type="button"
          className={mode === item.id ? 'active' : ''}
          onClick={() => onModeChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
