import { Html, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useLoader } from '@react-three/fiber';
import { memo, useMemo } from 'react';
import * as THREE from 'three';
import type { WallAssemblyInput, WallAssemblyViewerProps } from '../types';
import { getRenderLayers, getSectionBlocks, totalVisibleThickness } from '../lib/wallGeometry';

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
  texture?: string;
  showLabel: boolean;
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
  texture,
  showLabel,
}: SolidBlockProps) {
  const width = widthMm * MM_TO_UNIT;
  const height = heightMm * MM_TO_UNIT;
  const depth = visualThicknessMm * MM_TO_UNIT;
  const z = centerVisualMm * MM_TO_UNIT;
  const textureMap = useMemo(() => makeNoiseTexture(color, texture), [color, texture]);
  const settings = materialSettings(texture);

  return (
    <group>
      <mesh position={[0, height / 2, z]} castShadow receiveShadow>
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
      <lineSegments position={[0, height / 2, z]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
        <lineBasicMaterial color="#2b2f35" transparent opacity={0.28} />
      </lineSegments>
      {showLabel ? (
        <Html
          position={[width / 2 + 0.45, height * 0.54, z]}
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
  const sectionBlocks = useMemo(() => (data ? getSectionBlocks(data) : []), [data]);
  const renderLayers = useMemo(
    () => (data ? getRenderLayers(data, minVisualThicknessMm) : []),
    [data, minVisualThicknessMm],
  );

  let cursor = 0;
  const phaseTwoBlocks = sectionBlocks.map((block) => {
    const visualThicknessMm = Math.max(block.thicknessMm, minVisualThicknessMm);
    const centered = cursor + visualThicknessMm / 2;
    cursor += visualThicknessMm;
    return { ...block, visualThicknessMm, centerVisualMm: centered };
  });

  const totalVisualMm =
    phase === 1
      ? fallbackThicknessMm
      : phase === 2
        ? phaseTwoBlocks.reduce((sum, block) => sum + block.visualThicknessMm, 0)
        : renderLayers.reduce((sum, layer) => sum + layer.visualThicknessMm, 0);
  const totalWidth = widthMm * MM_TO_UNIT;
  const totalHeight = heightMm * MM_TO_UNIT;
  const totalDepth = Math.max(totalVisualMm, fallbackThicknessMm) * MM_TO_UNIT;

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[totalWidth * 0.72, totalHeight * 0.62, totalDepth * 5 + 8]}
        fov={38}
      />
      <OrbitControls
        enableDamping
        minDistance={10}
        maxDistance={60}
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
              label={block.title}
              thicknessMm={block.thicknessMm}
              visualThicknessMm={block.visualThicknessMm}
              centerVisualMm={block.centerVisualMm}
              color={block.color}
              widthMm={widthMm}
              heightMm={heightMm}
              texture={block.id === 'existingWall' ? 'concrete' : 'gypsum'}
              showLabel={showLabels}
            />
          ))
        : null}

      {phase === 3
        ? renderLayers.map((layer) => (
            <SolidBlock
              key={layer.id}
              label={layer.name}
              thicknessMm={layer.thicknessMm}
              visualThicknessMm={layer.visualThicknessMm}
              centerVisualMm={layer.centerVisualMm}
              color={layer.color}
              widthMm={widthMm}
              heightMm={heightMm}
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
    const sections = getSectionBlocks(data);
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
        <p>Totaal zichtbaar: {formatMm(totalVisibleThickness(data))}</p>
      </aside>
    );
  }

  return (
    <aside className="legend-panel">
      <h2>Fase 3</h2>
      {(['existingWall', 'newWall'] as const).map((sectionId) => {
        const section = data[sectionId];
        const visible = section.layers.filter((layer) => layer.visible !== false);
        return (
          <section key={sectionId} className="legend-section">
            <h3>{section.title}</h3>
            {visible.map((layer) => (
              <div className="legend-row" key={layer.id}>
                <span className="legend-swatch" style={{ background: layer.color }} />
                <span>{layer.name}</span>
                <strong>{formatMm(layer.thicknessMm)}</strong>
              </div>
            ))}
          </section>
        );
      })}
      <p>Totaal zichtbaar: {formatMm(totalVisibleThickness(data))}</p>
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
