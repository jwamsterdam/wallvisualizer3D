type DisplayControlsProps = {
  showLabels: boolean;
  onShowLabelsChange?: (showLabels: boolean) => void;
  onScreenshot?: () => void;
};

export function DisplayControls({
  showLabels,
  onShowLabelsChange,
  onScreenshot,
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
      <button type="button" className="secondary-button" onClick={onScreenshot}>
        Screenshot maken
      </button>
    </section>
  );
}
