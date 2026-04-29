import { Html, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { memo, useMemo } from 'react';
import * as THREE from 'three';
import type { WallAssemblyInput, WallAssemblyViewerProps, WallLayer } from '../types';
import { sectionThickness, visibleLayers } from '../lib/wallGeometry';

const MM_TO_UNIT = 0.012;
const DEFAULT_WIDTH_MM = 2600;
const DEFAULT_HEIGHT_MM = 1600;
const DEFAULT_MIN_VISUAL_THICKNESS_MM = 24;

type SolidBlockProps = {
  label: string;
  thicknessMm: number;
  visualThicknessMm: number;
  centerVisualMm: number;
  color: string;
  widthMm: number;
  heightMm: number;
  centerXMm?: number;
  texture?: string;
  showLabel: boolean;
};

type ComparisonBlock = {
  id: string;
  label: string;
  thicknessMm: number;
  visualThicknessMm: number;
  centerVisualMm: number;
  color: string;
  widthMm: number;
  centerXMm: number;
  texture?: string;
};

type ComparisonLayer = WallLayer & {
  renderId: string;
  centerXMm: number;
  widthMm: number;
  visualThicknessMm: number;
  centerVisualMm: number;
};

function makeNoiseTexture(color: string, textureName = 'default') {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  const base = new THREE.Color(color);
  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const strokes = textureName === 'insulation' ? 190 : textureName === 'gypsum' ? 55 : 120;
  for (let i = 0; i < strokes; i += 1) {
    const lightness = 0.82 + Math.random() * 0.28;
    const alpha = textureName === 'air' ? 0.1 : 0.16;
    const strokeColor = base.clone().multiplyScalar(lightness);
    context.strokeStyle = `rgba(${Math.round(strokeColor.r * 255)}, ${Math.round(
      strokeColor.g * 255,
    )}, ${Math.round(strokeColor.b * 255)}, ${alpha})`;
    context.lineWidth = textureName === 'insulation' ? 1.4 : 0.8;
    context.beginPath();
    context.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    context.lineTo(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
    );
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.needsUpdate = true;
  return texture;
}

function materialSettings(textureName?: string) {
  switch (textureName) {
    case 'air':
      return { roughness: 0.35, metalness: 0, transparent: true, opacity: 0.48 };
    case 'concrete':
      return { roughness: 0.9, metalness: 0, transparent: false, opacity: 1 };
    case 'insulation':
      return { roughness: 0.95, metalness: 0, transparent: false, opacity: 1 };
    case 'gypsum':
      return { roughness: 0.78, metalness: 0, transparent: false, opacity: 1 };
    default:
      return { roughness: 0.72, metalness: 0, transparent: false, opacity: 1 };
  }
}

const SolidBlock = memo(function SolidBlock({
  label,
  thicknessMm,
  visualThicknessMm,
  centerVisualMm,
  color,
  widthMm,
  heightMm,
  centerXMm = 0,
  texture,
  showLabel,
}: SolidBlockProps) {
  const width = widthMm * MM_TO_UNIT;
  const height = heightMm * MM_TO_UNIT;
  const depth = visualThicknessMm * MM_TO_UNIT;
  const x = centerXMm * MM_TO_UNIT;
  const z = centerVisualMm * MM_TO_UNIT;
  const textureMap = useMemo(() => makeNoiseTexture(color, texture), [color, texture]);
  const settings = materialSettings(texture);

  return (
    <group>
      <mesh position={[x, height / 2, z]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          map={textureMap ?? undefined}
          roughness={settings.roughness}
          metalness={settings.metalness}
          transparent={settings.transparent}
          opacity={settings.opacity}
        />
      </mesh>
      <lineSegments position={[x, height / 2, z]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
        <lineBasicMaterial color="#2b2f35" transparent opacity={0.28} />
      </lineSegments>
      {showLabel ? (
        <Html
          position={[x + width / 2 + 0.45, height * 0.54, z]}
          center
          distanceFactor={11}
          className="viewer-label"
        >
          <span>{label}</span>
          <strong>{formatMm(thicknessMm)}</strong>
        </Html>
      ) : null}
    </group>
  );
});

function Scene({
  data,
  phase,
  widthMm,
  heightMm,
  showLabels,
  minVisualThicknessMm,
}: Required<Pick<WallAssemblyViewerProps, 'phase' | 'widthMm' | 'heightMm' | 'showLabels' | 'minVisualThicknessMm'>> & {
  data?: WallAssemblyInput;
}) {
  const fallbackThicknessMm = 180;
  const halfWidthMm = widthMm / 2;
  const leftCenterXMm = -widthMm / 4;
  const rightCenterXMm = widthMm / 4;
  const existingThicknessMm = data ? sectionThickness(data.existingWall) : 0;
  const newAdditionThicknessMm = data ? sectionThickness(data.newWall) : 0;
  const newConstructionThicknessMm = existingThicknessMm + newAdditionThicknessMm;

  const phaseTwoBlocks = useMemo<ComparisonBlock[]>(() => {
    if (!data) {
      return [];
    }

    return [
      {
        id: 'old-situation',
        label: data.existingWall.title,
        thicknessMm: existingThicknessMm,
        visualThicknessMm: Math.max(existingThicknessMm, minVisualThicknessMm),
        centerVisualMm: Math.max(existingThicknessMm, minVisualThicknessMm) / 2,
        color: '#aaa69e',
        widthMm: halfWidthMm,
        centerXMm: leftCenterXMm,
        texture: 'concrete',
      },
      {
        id: 'new-situation',
        label: data.newWall.title,
        thicknessMm: newConstructionThicknessMm,
        visualThicknessMm: Math.max(newConstructionThicknessMm, minVisualThicknessMm),
        centerVisualMm: Math.max(newConstructionThicknessMm, minVisualThicknessMm) / 2,
        color: '#d4be72',
        widthMm: halfWidthMm,
        centerXMm: rightCenterXMm,
        texture: 'gypsum',
      },
    ];
  }, [
    data,
    existingThicknessMm,
    halfWidthMm,
    leftCenterXMm,
    minVisualThicknessMm,
    newConstructionThicknessMm,
    rightCenterXMm,
  ]);

  const renderLayers = useMemo<ComparisonLayer[]>(() => {
    if (!data) {
      return [];
    }

    const buildStack = (
      layers: WallLayer[],
      centerXMm: number,
      sideWidthMm: number,
      renderPrefix: string,
    ) => {
      let cursorMm = 0;
      return visibleLayers(layers).map((layer) => {
        const visualThicknessMm = Math.max(layer.thicknessMm, minVisualThicknessMm);
        const renderLayer: ComparisonLayer = {
          ...layer,
          renderId: `${renderPrefix}-${layer.id}`,
          centerXMm,
          widthMm: sideWidthMm,
          visualThicknessMm,
          centerVisualMm: cursorMm + visualThicknessMm / 2,
        };
        cursorMm += visualThicknessMm;
        return renderLayer;
      });
    };

    return [
      ...buildStack(data.existingWall.layers, leftCenterXMm, halfWidthMm, 'old'),
      ...buildStack(
        [...data.existingWall.layers, ...data.newWall.layers],
        rightCenterXMm,
        halfWidthMm,
        'new',
      ),
    ];
  }, [data, halfWidthMm, leftCenterXMm, minVisualThicknessMm, rightCenterXMm]);

  const totalVisualMm =
    phase === 1
      ? fallbackThicknessMm
      : phase === 2
        ? Math.max(...phaseTwoBlocks.map((block) => block.visualThicknessMm), fallbackThicknessMm)
        : Math.max(...renderLayers.map((layer) => layer.centerVisualMm + layer.visualThicknessMm / 2), fallbackThicknessMm);
  const totalWidth = widthMm * MM_TO_UNIT;
  const totalHeight = heightMm * MM_TO_UNIT;
  const totalDepth = Math.max(totalVisualMm, fallbackThicknessMm) * MM_TO_UNIT;
  const maxSceneDimension = Math.max(totalWidth, totalHeight, totalDepth);
  const cameraDistance = maxSceneDimension * 1.25;

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[totalWidth * 0.72, totalHeight * 0.62, cameraDistance]}
        fov={38}
      />
      <OrbitControls
        enableDamping
        enableZoom
        zoomSpeed={0.85}
        minDistance={Math.max(6, maxSceneDimension * 0.18)}
        maxDistance={Math.max(80, maxSceneDimension * 3)}
        target={[0, totalHeight / 2, totalDepth / 2]}
      />
      <ambientLight intensity={0.75} />
      <directionalLight position={[9, 12, 8]} intensity={1.25} castShadow />
      <directionalLight position={[-6, 5, -5]} intensity={0.45} />
      <gridHelper args={[36, 18, '#a9b1bd', '#d4d9df']} position={[0, -0.02, totalDepth / 2]} />

      {phase === 1 ? (
        <SolidBlock
          label="Wandblok"
          thicknessMm={fallbackThicknessMm}
          visualThicknessMm={fallbackThicknessMm}
          centerVisualMm={fallbackThicknessMm / 2}
          color="#b8b3aa"
          widthMm={widthMm}
          heightMm={heightMm}
          texture="concrete"
          showLabel={showLabels}
        />
      ) : null}

      {phase === 2
        ? phaseTwoBlocks.map((block) => (
            <SolidBlock
              key={block.id}
              label={block.label}
              thicknessMm={block.thicknessMm}
              visualThicknessMm={block.visualThicknessMm}
              centerVisualMm={block.centerVisualMm}
              color={block.color}
              widthMm={block.widthMm}
              heightMm={heightMm}
              centerXMm={block.centerXMm}
              texture={block.texture}
              showLabel={showLabels}
            />
          ))
        : null}

      {phase === 3
        ? renderLayers.map((layer) => (
            <SolidBlock
              key={layer.renderId}
              label={layer.name}
              thicknessMm={layer.thicknessMm}
              visualThicknessMm={layer.visualThicknessMm}
              centerVisualMm={layer.centerVisualMm}
              color={layer.color}
              widthMm={layer.widthMm}
              heightMm={heightMm}
              centerXMm={layer.centerXMm}
              texture={layer.texture}
              showLabel={showLabels}
            />
          ))
        : null}
    </>
  );
}

function formatMm(value: number) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)} mm`;
}

function Legend({
  data,
  phase,
}: {
  data?: WallAssemblyInput;
  phase: 1 | 2 | 3;
}) {
  if (phase === 1 || !data) {
    return (
      <aside className="legend-panel">
        <h2>Fase 1</h2>
        <p>Een enkel 3D wandblok in de definitieve orientatie.</p>
      </aside>
    );
  }

  if (phase === 2) {
    const existingThicknessMm = sectionThickness(data.existingWall);
    const newAdditionThicknessMm = sectionThickness(data.newWall);
    const sections = [
      {
        id: 'old-situation',
        title: `${data.existingWall.title} (0-3 m)`,
        color: '#aaa69e',
        thicknessMm: existingThicknessMm,
      },
      {
        id: 'new-situation',
        title: `${data.newWall.title} (3-6 m)`,
        color: '#d4be72',
        thicknessMm: existingThicknessMm + newAdditionThicknessMm,
      },
    ];
    return (
      <aside className="legend-panel">
        <h2>Fase 2</h2>
        {sections.map((section) => (
          <div className="legend-row" key={section.id}>
            <span className="legend-swatch" style={{ background: section.color }} />
            <span>{section.title}</span>
            <strong>{formatMm(section.thicknessMm)}</strong>
          </div>
        ))}
        <p>Nieuwe situatie bevat ook de bestaande constructie.</p>
      </aside>
    );
  }

  const existingLayers = visibleLayers(data.existingWall.layers);
  const newLayers = visibleLayers([...data.existingWall.layers, ...data.newWall.layers]);

  return (
    <aside className="legend-panel">
      <h2>Fase 3</h2>
      {[
        { id: 'old', title: `${data.existingWall.title} (0-3 m)`, layers: existingLayers },
        { id: 'new', title: `${data.newWall.title} (3-6 m)`, layers: newLayers },
      ].map((section) => {
        return (
          <section key={section.id} className="legend-section">
            <h3>{section.title}</h3>
            {section.layers.map((layer) => (
              <div className="legend-row" key={layer.id}>
                <span className="legend-swatch" style={{ background: layer.color }} />
                <span>{layer.name}</span>
                <strong>{formatMm(layer.thicknessMm)}</strong>
              </div>
            ))}
          </section>
        );
      })}
      <p>Rechts is de nieuwe situatie inclusief bestaande constructie.</p>
    </aside>
  );
}

export function WallAssemblyViewer({
  data,
  widthMm = DEFAULT_WIDTH_MM,
  heightMm = DEFAULT_HEIGHT_MM,
  showLabels = true,
  showLegend = true,
  minVisualThicknessMm = DEFAULT_MIN_VISUAL_THICKNESS_MM,
  phase = 3,
}: WallAssemblyViewerProps) {
  return (
    <div className="wall-viewer">
      <div className="canvas-shell" aria-label="3D constructiewand viewer">
        <Canvas shadows dpr={[1, 1.8]}>
          <color attach="background" args={['#f3f6f8']} />
          <Scene
            data={data}
            phase={phase}
            widthMm={widthMm}
            heightMm={heightMm}
            showLabels={showLabels}
            minVisualThicknessMm={minVisualThicknessMm}
          />
        </Canvas>
      </div>
      {showLegend ? <Legend data={data} phase={phase} /> : null}
    </div>
  );
}
