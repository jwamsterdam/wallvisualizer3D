import { formatMm } from '../../lib/format';
import { visibleLayers } from '../../lib/wallGeometry';
import type { WallAssemblyInput } from '../../types';

type ComposerPanelProps = {
  data?: WallAssemblyInput;
};

export function ComposerPanel({ data }: ComposerPanelProps) {
  if (!data) {
    return (
      <div className="sidebar-tab-panel" role="tabpanel">
        <p>Geen muuropbouw geladen.</p>
      </div>
    );
  }

  const sections = [
    {
      id: 'old',
      title: `${data.existingWall.title} (0-3 m)`,
      layers: visibleLayers(data.existingWall.layers),
    },
    {
      id: 'new',
      title: `${data.newWall.title} (3-6 m)`,
      layers: visibleLayers([...data.existingWall.layers, ...data.newWall.layers]),
    },
  ];

  return (
    <div className="sidebar-tab-panel" role="tabpanel">
      {sections.map((section) => (
        <section key={section.id} className="legend-section">
          <h3>{section.title}</h3>
          {section.layers.map((layer) => (
            <div className="legend-row" key={`${section.id}-${layer.id}`}>
              <span className="legend-swatch" style={{ background: layer.color }} />
              <span>{layer.name}</span>
              <strong>{formatMm(layer.thicknessMm)}</strong>
            </div>
          ))}
        </section>
      ))}
      <p>Rechts is de nieuwe situatie inclusief bestaande constructie.</p>
    </div>
  );
}
