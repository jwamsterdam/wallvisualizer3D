type ComparableVolumeControlProps = {
  volume: number;
  onVolumeChange: (volume: number) => void;
};

export function ComparableVolumeControl({
  volume,
  onVolumeChange,
}: ComparableVolumeControlProps) {
  return (
    <label className="audio-volume">
      <span>
        Vergelijkbaar volume
        <strong>{Math.round(volume * 100)}%</strong>
      </span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(event) => onVolumeChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}
