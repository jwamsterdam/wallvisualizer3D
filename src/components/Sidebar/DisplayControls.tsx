type DisplayControlsProps = {
  showLabels: boolean;
  onShowLabelsChange?: (showLabels: boolean) => void;
};

export function DisplayControls({
  showLabels,
  onShowLabelsChange,
}: DisplayControlsProps) {
  return (
    <section className="display-controls">
      <h3>Weergave</h3>
      <label className="toggle-row">
        <span>Labels tonen</span>
        <input
          type="checkbox"
          checked={showLabels}
          onChange={(event) => onShowLabelsChange?.(event.currentTarget.checked)}
        />
      </label>
    </section>
  );
}
