import { useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import type { MaterialDefinition, WallAssemblyInput, WallLayer } from '../../types';

type SectionKey = keyof WallAssemblyInput;

type ComposerPanelProps = {
  data?: WallAssemblyInput;
  materials: MaterialDefinition[];
  onAddLayer?: (sectionKey: SectionKey, materialId: string) => void;
  onChangeLayerMaterial?: (sectionKey: SectionKey, layerId: string, materialId: string) => void;
  onUpdateLayer?: (
    sectionKey: SectionKey,
    layerId: string,
    patch: Partial<Pick<WallLayer, 'thicknessMm'>>,
  ) => void;
  onRemoveLayer?: (sectionKey: SectionKey, layerId: string) => void;
  onMoveLayer?: (sectionKey: SectionKey, fromIndex: number, toIndex: number) => void;
};

type DragState = {
  sectionKey: SectionKey;
  fromIndex: number;
  dropIndex: number;
} | null;

const sectionKeys: SectionKey[] = ['existingWall', 'newWall'];

function materialIdForLayer(layer: WallLayer, materials: MaterialDefinition[]) {
  return (
    materials.find(
      (material) =>
        material.name === layer.name &&
        material.material === layer.material &&
        material.color === layer.color &&
        material.texture === layer.texture,
    )?.id ?? materials[0]?.id ?? ''
  );
}

function clampDropIndex(index: number, length: number) {
  return Math.max(0, Math.min(index, length));
}

function getDropIndex(event: DragEvent<HTMLElement>, index: number) {
  const bounds = event.currentTarget.getBoundingClientRect();
  const isAfterMidpoint = event.clientY > bounds.top + bounds.height / 2;
  return index + (isAfterMidpoint ? 1 : 0);
}

export function ComposerPanel({
  data,
  materials,
  onAddLayer,
  onChangeLayerMaterial,
  onUpdateLayer,
  onRemoveLayer,
  onMoveLayer,
}: ComposerPanelProps) {
  const [dragState, setDragState] = useState<DragState>(null);
  const sectionAddMaterials = useMemo(
    () =>
      sectionKeys.reduce<Record<SectionKey, string>>(
        (selection, section) => ({
          ...selection,
          [section]: '',
        }),
        { existingWall: '', newWall: '' },
      ),
    [],
  );
  const [selectedMaterialBySection, setSelectedMaterialBySection] = useState(sectionAddMaterials);

  if (!data) {
    return (
      <div className="sidebar-tab-panel" role="tabpanel">
        <p>Geen muuropbouw geladen.</p>
      </div>
    );
  }

  return (
    <div className="sidebar-tab-panel composer-panel" role="tabpanel">
      {sectionKeys.map((sectionKey) => {
        const wallSection = data[sectionKey];
        const activeDropIndex =
          dragState?.sectionKey === sectionKey ? dragState.dropIndex : null;

        return (
          <section key={sectionKey} className="composer-section">
            <h3>{wallSection.title}</h3>
            <div
              className="composer-layer-list"
              onDragOver={(event) => {
                if (wallSection.layers.length === 0) {
                  event.preventDefault();
                  setDragState((current) =>
                    current?.sectionKey === sectionKey ? { ...current, dropIndex: 0 } : current,
                  );
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (dragState?.sectionKey === sectionKey) {
                  onMoveLayer?.(sectionKey, dragState.fromIndex, dragState.dropIndex);
                }
                setDragState(null);
              }}
            >
              {activeDropIndex === 0 ? <div className="composer-drop-indicator" /> : null}
              {wallSection.layers.map((layer, index) => (
                <div key={layer.id}>
                  <div
                    className={[
                      'composer-layer',
                      dragState?.sectionKey === sectionKey && dragState.fromIndex === index
                        ? 'is-dragging'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', layer.id);
                      setDragState({ sectionKey, fromIndex: index, dropIndex: index });
                    }}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      const dropIndex = clampDropIndex(
                        getDropIndex(event, index),
                        wallSection.layers.length,
                      );
                      setDragState((current) =>
                        current?.sectionKey === sectionKey ? { ...current, dropIndex } : current,
                      );
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'move';
                      const dropIndex = clampDropIndex(
                        getDropIndex(event, index),
                        wallSection.layers.length,
                      );
                      setDragState((current) =>
                        current?.sectionKey === sectionKey ? { ...current, dropIndex } : current,
                      );
                    }}
                    onDragEnd={() => {
                      setDragState(null);
                    }}
                  >
                    <span className="composer-drag-handle" aria-hidden="true">
                      ::
                    </span>
                    <span className="legend-swatch" style={{ background: layer.color }} />
                    <label>
                      <span>Materiaal</span>
                      <select
                        aria-label="Materiaal"
                        value={materialIdForLayer(layer, materials)}
                        onChange={(event) =>
                          onChangeLayerMaterial?.(sectionKey, layer.id, event.currentTarget.value)
                        }
                      >
                        {materials.map((material) => (
                          <option key={material.id} value={material.id}>
                            {material.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Dikte</span>
                      <input
                        type="number"
                        min={1}
                        step={0.5}
                        value={layer.thicknessMm}
                        onChange={(event) =>
                          onUpdateLayer?.(sectionKey, layer.id, {
                            thicknessMm: Number(event.currentTarget.value),
                          })
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`${layer.name} verwijderen`}
                      onClick={() => onRemoveLayer?.(sectionKey, layer.id)}
                    >
                      x
                    </button>
                  </div>
                  {activeDropIndex === index + 1 ? (
                    <div className="composer-drop-indicator" />
                  ) : null}
                </div>
              ))}
            </div>
            <div className="composer-add-layer">
              <select
                aria-label={`Materiaal toevoegen aan ${wallSection.title}`}
                value={selectedMaterialBySection[sectionKey] ?? ''}
                onChange={(event) =>
                  setSelectedMaterialBySection((current) => ({
                    ...current,
                    [sectionKey]: event.currentTarget.value,
                  }))
                }
              >
                <option value="" disabled>
                  Kies materiaal...
                </option>
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedMaterialBySection[sectionKey]}
                onClick={() => {
                  const materialId = selectedMaterialBySection[sectionKey];

                  if (materialId) {
                    onAddLayer?.(sectionKey, materialId);
                    setSelectedMaterialBySection((current) => ({ ...current, [sectionKey]: '' }));
                  }
                }}
              >
                Laag toevoegen
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
