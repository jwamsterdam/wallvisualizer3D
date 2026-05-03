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

type ThicknessInputState = Record<string, string | undefined>;

const sectionKeys: SectionKey[] = ['existingWall', 'newWall'];

function materialIdForLayer(layer: WallLayer, materials: MaterialDefinition[]) {
  return (
    materials.find(
      (material) =>
        material.name === layer.name &&
        material.uiCategory === layer.material,
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

function formatThicknessInput(value: number) {
  return Number.isInteger(value) ? String(value) : String(value).replace('.', ',');
}

function parseThicknessInput(value: string) {
  const normalizedValue = value.trim().replace(',', '.');

  if (!/^\d*\.?\d*$/.test(normalizedValue) || normalizedValue === '') {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function isValidThicknessDraft(value: string) {
  return /^\d*([,.]\d*)?$/.test(value);
}

function normalizeThicknessDraft(value: string) {
  return value.replace(/^0+(?=\d)/, '');
}

function hasImageTexture(texture?: string) {
  return texture?.startsWith('/materials/');
}

function layerSwatchStyle(layer: WallLayer) {
  if (!hasImageTexture(layer.texture)) {
    return { backgroundColor: layer.color };
  }

  return {
    backgroundColor: layer.color,
    backgroundImage: `url("${layer.texture}")`,
  };
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
  const [thicknessInputs, setThicknessInputs] = useState<ThicknessInputState>({});
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

  const renderDropIndicator = (sectionKey: SectionKey, dropIndex: number) => (
    <div
      className="composer-drop-indicator"
      onDragEnter={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragState((current) =>
          current?.sectionKey === sectionKey ? { ...current, dropIndex } : current,
        );
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';
        setDragState((current) =>
          current?.sectionKey === sectionKey ? { ...current, dropIndex } : current,
        );
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();

        if (dragState?.sectionKey === sectionKey) {
          onMoveLayer?.(sectionKey, dragState.fromIndex, dropIndex);
        }

        setDragState(null);
      }}
    />
  );

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
              {activeDropIndex === 0 ? renderDropIndicator(sectionKey, 0) : null}
              {wallSection.layers.map((layer, index) => {
                const thicknessInputKey = `${sectionKey}:${layer.id}`;
                const thicknessInputValue =
                  thicknessInputs[thicknessInputKey] ?? formatThicknessInput(layer.thicknessMm);

                return (
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
                        <svg viewBox="0 0 16 20" focusable="false">
                          <path d="M8 1.75 4.75 5h2.1v10h-2.1L8 18.25 11.25 15h-2.1V5h2.1L8 1.75Z" />
                        </svg>
                      </span>
                      <span
                        className={[
                          'legend-swatch',
                          hasImageTexture(layer.texture) ? 'legend-swatch--texture' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={layerSwatchStyle(layer)}
                      />
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
                          type="text"
                          inputMode="decimal"
                          value={thicknessInputValue}
                          onBlur={() => {
                            const thicknessMm = parseThicknessInput(thicknessInputValue);

                            if (thicknessMm !== null) {
                              onUpdateLayer?.(sectionKey, layer.id, {
                                thicknessMm: Math.max(1, thicknessMm),
                              });
                            }

                            setThicknessInputs((current) => ({
                              ...current,
                              [thicknessInputKey]: undefined,
                            }));
                          }}
                          onChange={(event) => {
                            const rawValue = event.currentTarget.value;

                            if (!isValidThicknessDraft(rawValue)) {
                              return;
                            }

                            const nextValue = normalizeThicknessDraft(rawValue);
                            setThicknessInputs((current) => ({
                              ...current,
                              [thicknessInputKey]: nextValue,
                            }));

                            if (!/[,.]$/.test(nextValue)) {
                              const thicknessMm = parseThicknessInput(nextValue);

                              if (thicknessMm !== null) {
                                onUpdateLayer?.(sectionKey, layer.id, { thicknessMm });
                              }
                            }
                          }}
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
                    {activeDropIndex === index + 1
                      ? renderDropIndicator(sectionKey, index + 1)
                      : null}
                  </div>
                );
              })}
            </div>
            <div className="composer-add-layer">
              <select
                aria-label={`Materiaal toevoegen aan ${wallSection.title}`}
                value={selectedMaterialBySection[sectionKey] ?? ''}
                onChange={(event) => {
                  const materialId = event.currentTarget.value;

                  setSelectedMaterialBySection((current) => ({
                    ...current,
                    [sectionKey]: materialId,
                  }));
                }}
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
