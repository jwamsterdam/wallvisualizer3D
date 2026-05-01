import { Environment, Html, Line, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { memo, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type {
  GroundShadowSettings,
  SoundMode,
  SoundWaveSettings,
  WallAssemblyInput,
  WallAssemblyViewportProps,
  WallLayer,
} from '../../types';
import { visibleLayers } from '../../lib/wallGeometry';

const MM_TO_UNIT = 0.012;
const DEFAULT_WIDTH_MM = 2600;
const DEFAULT_HEIGHT_MM = 1600;
const DEFAULT_MIN_VISUAL_THICKNESS_MM = 24;
const TEXTURE_ANISOTROPY = 8;
const WALL_TEXTURE_HEIGHT_MM = 2800;
const WALL_TEXTURE_WIDTH_MM = 1400;
const KALKSANDSTONE_TEXTURE_WIDTH_MM = 3000;
const KALKSANDSTONE_TEXTURE_HEIGHT_MM = 2800;
const BRICK_TEXTURE_WIDTH_MM = 1100;
const BRICK_TEXTURE_HEIGHT_MM = 1200;
const STONE_WOOL_TEXTURE_WIDTH_MM = 1200;
const STONE_WOOL_TEXTURE_HEIGHT_MM = 1200;
const BRICK_WIDTH_MM = 210;
const BRICK_HEIGHT_MM = 65;
const MORTAR_MM = 10;
const DEFAULT_GROUND_SHADOW: GroundShadowSettings = {
  opacity: 0.2,
  xOffset: -3.1,
  yOffset: 0.2,
  blur: 16.2,
  spread: -1.3,
  color: '#111111',
};
const DEFAULT_SOUND_WAVE: SoundWaveSettings = {
  speed: 0.15,
  depth: 2.4,
  opacity: 0.8,
  oldColor: '#f59e0b',
  newColor: '#3b82f6',
};
const CLICK_DRAG_THRESHOLD_PX = 5;

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
  onSelect?: () => void;
};

type ComparisonLayer = WallLayer & {
  renderId: string;
  centerXMm: number;
  widthMm: number;
  visualThicknessMm: number;
  centerVisualMm: number;
};

type LayerGroupCalloutProps = {
  title: string;
  layers: ComparisonLayer[];
  centerXMm: number;
  widthMm: number;
  heightMm: number;
};

type RoomSurfacesProps = {
  width: number;
  height: number;
  depth: number;
};

type WallBoxProps = {
  width: number;
  height: number;
  depth: number;
  color: string;
  texture?: string;
};

type GroundOcclusionProps = {
  width: number;
  depth: number;
  centerX: number;
  centerZ: number;
  settings: GroundShadowSettings;
};

type GroundShadowSegment = {
  width: number;
  depth: number;
  centerX: number;
  centerZ: number;
};

type SoundWaveOverlayProps = {
  mode: SoundMode;
  settings: SoundWaveSettings;
  oldCenterX: number;
  newCenterX: number;
  zoneWidth: number;
  height: number;
  oldDepth: number;
  newDepth: number;
};

type WallMaterialProps = {
  color: string;
  texture?: string;
  textureRepeatX: number;
  textureRepeatY: number;
};

function makeNoiseTexture(color: string, textureName = 'default') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  const base = new THREE.Color(color);
  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (textureName === 'concrete') {
    const pxPerMm = canvas.height / WALL_TEXTURE_HEIGHT_MM;
    const brickHeight = BRICK_HEIGHT_MM * pxPerMm;
    const brickWidth = BRICK_WIDTH_MM * pxPerMm;
    const mortar = MORTAR_MM * pxPerMm;
    context.fillStyle = '#7f837d';

    for (let y = 0; y < canvas.height + brickHeight; y += brickHeight) {
      const row = Math.floor(y / brickHeight);
      const offset = row % 2 === 0 ? 0 : -brickWidth / 2;

      for (let x = offset; x < canvas.width + brickWidth; x += brickWidth) {
        const shade = 0.82 + Math.random() * 0.22;
        const brick = base.clone().multiplyScalar(shade);
        context.fillStyle = `rgb(${Math.round(brick.r * 255)}, ${Math.round(
          brick.g * 255,
        )}, ${Math.round(brick.b * 255)})`;
        context.fillRect(x + mortar, y + mortar, brickWidth - mortar, brickHeight - mortar);
      }
    }

    context.strokeStyle = 'rgba(255, 255, 255, 0.13)';
    context.lineWidth = 1;
    for (let i = 0; i < 520; i += 1) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      context.globalAlpha = 0.16;
      context.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#202521';
      context.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
    context.globalAlpha = 1;
  }

  const strokes = textureName === 'insulation' ? 220 : textureName === 'gypsum' ? 34 : 58;
  for (let i = 0; i < strokes; i += 1) {
    const lightness = 0.82 + Math.random() * 0.28;
    const alpha = textureName === 'air' ? 0.06 : textureName === 'gypsum' ? 0.045 : 0.12;
    const strokeColor = base.clone().multiplyScalar(lightness);
    context.strokeStyle = `rgba(${Math.round(strokeColor.r * 255)}, ${Math.round(
      strokeColor.g * 255,
    )}, ${Math.round(strokeColor.b * 255)}, ${alpha})`;
    context.lineWidth = textureName === 'insulation' ? 1.2 : 0.6;
    context.beginPath();
    context.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    context.lineTo(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
    );
    context.stroke();
  }

  const bottomShade = context.createLinearGradient(0, canvas.height, 0, canvas.height * 0.76);
  bottomShade.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
  bottomShade.addColorStop(0.32, 'rgba(0, 0, 0, 0.11)');
  bottomShade.addColorStop(0.72, 'rgba(0, 0, 0, 0.035)');
  bottomShade.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = bottomShade;
  context.fillRect(0, canvas.height * 0.76, canvas.width, canvas.height * 0.24);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = TEXTURE_ANISOTROPY;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function makeBumpTexture(textureName = 'default') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  context.fillStyle = '#888888';
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (textureName === 'concrete') {
    const pxPerMm = canvas.height / WALL_TEXTURE_HEIGHT_MM;
    const brickHeight = BRICK_HEIGHT_MM * pxPerMm;
    const brickWidth = BRICK_WIDTH_MM * pxPerMm;
    const mortar = MORTAR_MM * pxPerMm;
    context.fillStyle = '#4a4a4a';
    for (let y = 0; y < canvas.height + brickHeight; y += brickHeight) {
      const row = Math.floor(y / brickHeight);
      const offset = row % 2 === 0 ? 0 : -brickWidth / 2;
      for (let x = offset; x < canvas.width + brickWidth; x += brickWidth) {
        context.fillRect(x, y, brickWidth, mortar);
        context.fillRect(x, y, mortar, brickHeight);
      }
    }
    context.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let i = 0; i < 450; i += 1) {
      context.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }
  } else if (textureName === 'insulation') {
    for (let i = 0; i < 360; i += 1) {
      context.strokeStyle = Math.random() > 0.5 ? '#aaaaaa' : '#676767';
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      context.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      context.stroke();
    }
  } else if (textureName === 'gypsum') {
    for (let i = 0; i < 180; i += 1) {
      const value = 118 + Math.random() * 45;
      context.fillStyle = `rgb(${value}, ${value}, ${value})`;
      context.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1.5, 1.5);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1, 1);
  texture.anisotropy = TEXTURE_ANISOTROPY;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

function makeAmbientOcclusionTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const edge = context.createRadialGradient(64, 64, 18, 64, 64, 91);
  edge.addColorStop(0, 'rgba(255, 255, 255, 1)');
  edge.addColorStop(0.62, 'rgba(235, 235, 235, 1)');
  edge.addColorStop(1, 'rgba(88, 88, 88, 1)');
  context.fillStyle = edge;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const vertical = context.createLinearGradient(0, 0, 0, canvas.height);
  vertical.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
  vertical.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
  vertical.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
  context.fillStyle = vertical;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function smoothFalloff(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function roundedBoxDistance(localX: number, localZ: number, halfWidth: number, halfDepth: number, radius: number) {
  const innerHalfWidth = Math.max(0.01, halfWidth - radius);
  const innerHalfDepth = Math.max(0.01, halfDepth - radius);
  const qx = Math.abs(localX) - innerHalfWidth;
  const qz = Math.abs(localZ) - innerHalfDepth;
  const outsideX = Math.max(qx, 0);
  const outsideZ = Math.max(qz, 0);
  const outsideDistance = Math.hypot(outsideX, outsideZ);
  const insideDistance = Math.min(Math.max(qx, qz), 0);
  return outsideDistance + insideDistance - radius;
}

function makeGroundOcclusionAlphaMap(
  planeWidth: number,
  planeDepth: number,
  segments: GroundShadowSegment[],
  settings: GroundShadowSettings,
) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  context.fillStyle = '#000000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const blur = Math.max(0.01, settings.blur);
  const spread = settings.spread;

  const image = context.createImageData(canvas.width, canvas.height);
  const pixels = image.data;

  for (let y = 0; y < canvas.height; y += 1) {
    const localZ = (y / (canvas.height - 1) - 0.5) * planeDepth;

    for (let x = 0; x < canvas.width; x += 1) {
      const localX = (x / (canvas.width - 1) - 0.5) * planeWidth;
      let alpha = 0;

      for (const segment of segments) {
        const shadowCenterX = segment.centerX + settings.xOffset;
        const shadowCenterZ = segment.centerZ + settings.yOffset;
        const halfShadowWidth = Math.max(0.01, segment.width / 2 + spread);
        const halfShadowDepth = Math.max(0.01, segment.depth / 2 + spread);
        const radius = Math.min(Math.max(blur + Math.max(spread, 0), 0.1), halfShadowWidth, halfShadowDepth);
        const distance = Math.max(
          0,
          roundedBoxDistance(
            localX - shadowCenterX,
            localZ - shadowCenterZ,
            halfShadowWidth,
            halfShadowDepth,
            radius,
          ),
        );
        const segmentAlpha = smoothFalloff(1 - distance / blur);
        alpha = Math.max(alpha, segmentAlpha);
      }

      const value = Math.round(alpha * 255);
      const index = (y * canvas.width + x) * 4;
      pixels[index] = value;
      pixels[index + 1] = value;
      pixels[index + 2] = value;
      pixels[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function makeInfinitySurfaceTexture(
  baseColor: string,
  fadeToColor: string,
  direction: 'floor' | 'ceiling' | 'wall',
) {
  const canvas = document.createElement('canvas');
  canvas.width = direction === 'wall' ? 512 : 64;
  canvas.height = direction === 'wall' ? 64 : 512;
  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  const gradient =
    direction === 'wall'
      ? context.createLinearGradient(0, 0, canvas.width, 0)
      : context.createLinearGradient(0, 0, 0, canvas.height);
  if (direction === 'floor') {
    gradient.addColorStop(0, fadeToColor);
    gradient.addColorStop(0.22, baseColor);
    gradient.addColorStop(1, baseColor);
  } else if (direction === 'ceiling') {
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(0.78, baseColor);
    gradient.addColorStop(1, fadeToColor);
  } else {
    gradient.addColorStop(0, '#e7ecef');
    gradient.addColorStop(0.18, baseColor);
    gradient.addColorStop(1, fadeToColor);
  }

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

function materialSettings(textureName?: string) {
  if (textureName?.startsWith('/materials/kalkzandsteen/')) {
    return { roughness: 1, metalness: 0, transparent: false, opacity: 1, bumpScale: 0.085 };
  }

  if (textureName?.startsWith('/materials/steenwol/')) {
    return { roughness: 0.98, metalness: 0, transparent: false, opacity: 1, bumpScale: 0.065 };
  }

  switch (textureName) {
    case 'air':
      return { roughness: 0.46, metalness: 0, transparent: true, opacity: 0.34, bumpScale: 0 };
    case 'concrete':
      return { roughness: 0.92, metalness: 0, transparent: false, opacity: 1, bumpScale: 0.1 };
    case 'insulation':
      return { roughness: 0.96, metalness: 0, transparent: false, opacity: 1, bumpScale: 0.055 };
    case 'gypsum':
      return { roughness: 0.82, metalness: 0, transparent: false, opacity: 1, bumpScale: 0.018 };
    default:
      return { roughness: 0.78, metalness: 0, transparent: false, opacity: 1, bumpScale: 0.025 };
  }
}

function isKalkzandsteenTexture(textureName?: string) {
  return textureName?.startsWith('/materials/kalkzandsteen/');
}

function isBaksteenTexture(textureName?: string) {
  return textureName?.startsWith('/materials/baksteen/');
}

function isStoneWoolTexture(textureName?: string) {
  return textureName?.startsWith('/materials/steenwol/');
}

function imageMaterialTint(textureName?: string) {
  if (isKalkzandsteenTexture(textureName)) {
    return '#ffffff';
  }

  return '#ffffff';
}

function imageTextureSizeMm(textureName?: string) {
  if (isBaksteenTexture(textureName)) {
    return { widthMm: BRICK_TEXTURE_WIDTH_MM, heightMm: BRICK_TEXTURE_HEIGHT_MM };
  }

  if (isStoneWoolTexture(textureName)) {
    return { widthMm: STONE_WOOL_TEXTURE_WIDTH_MM, heightMm: STONE_WOOL_TEXTURE_HEIGHT_MM };
  }

  return { widthMm: KALKSANDSTONE_TEXTURE_WIDTH_MM, heightMm: KALKSANDSTONE_TEXTURE_HEIGHT_MM };
}

function makeAdjustedImageTexture(source: THREE.Texture, textureName?: string) {
  if (!isKalkzandsteenTexture(textureName)) {
    return source.clone();
  }

  const image = source.image as CanvasImageSource & { width?: number; height?: number };
  const width = image.width ?? 1024;
  const height = image.height ?? 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    return source.clone();
  }

  context.drawImage(image, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const contrast = 1;
  const brightness = 0;

  for (let index = 0; index < pixels.length; index += 4) {
    for (let channel = 0; channel < 3; channel += 1) {
      const value = pixels[index + channel];
      pixels[index + channel] = clamp((value - 128) * contrast + 128 + brightness, 0, 255);
    }
  }

  context.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = source.colorSpace;
  return texture;
}

function configureWallTexture(texture: THREE.Texture, repeatX: number, repeatY: number) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = repeatY > 1.01 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = TEXTURE_ANISOTROPY;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
}

function ProceduralWallMaterial({ color, texture, textureRepeatX }: WallMaterialProps) {
  const textureMap = useMemo(() => makeNoiseTexture(color, texture), [color, texture]);
  const aoMap = useMemo(() => makeAmbientOcclusionTexture(), []);
  const bumpMap = useMemo(() => makeBumpTexture(texture), [texture]);
  const settings = materialSettings(texture);

  if (textureMap) {
    textureMap.repeat.set(textureRepeatX, 1);
  }

  if (bumpMap) {
    bumpMap.repeat.set(textureRepeatX, 1);
  }

  return (
    <meshStandardMaterial
      color={color}
      map={textureMap ?? undefined}
      aoMap={aoMap ?? undefined}
      aoMapIntensity={0.48}
      bumpMap={bumpMap ?? undefined}
      bumpScale={settings.bumpScale}
      roughness={settings.roughness}
      metalness={settings.metalness}
      transparent={settings.transparent}
      opacity={settings.opacity}
    />
  );
}

function ImageWallMaterial({ texture, textureRepeatX, textureRepeatY }: WallMaterialProps) {
  const loadedTexture = useLoader(THREE.TextureLoader, texture ?? '');
  const textureMap = useMemo(() => makeAdjustedImageTexture(loadedTexture, texture), [loadedTexture, texture]);
  const bumpMap = useMemo(() => makeAdjustedImageTexture(loadedTexture, texture), [loadedTexture, texture]);
  const aoMap = useMemo(() => makeAmbientOcclusionTexture(), []);
  const settings = materialSettings(texture);

  configureWallTexture(textureMap, textureRepeatX, textureRepeatY);
  configureWallTexture(bumpMap, textureRepeatX, textureRepeatY);

  return (
    <meshStandardMaterial
      color={imageMaterialTint(texture)}
      map={textureMap}
      aoMap={aoMap ?? undefined}
      aoMapIntensity={isKalkzandsteenTexture(texture) ? 0.46 : 0.42}
      bumpMap={bumpMap}
      bumpScale={settings.bumpScale}
      roughness={settings.roughness}
      metalness={settings.metalness}
      transparent={settings.transparent}
      opacity={settings.opacity}
    />
  );
}

function WallBox({ width, height, depth, color, texture }: WallBoxProps) {
  const usesImageTexture = texture?.startsWith('/materials/');
  const imageTextureSize = imageTextureSizeMm(texture);
  const textureRepeatX =
    texture === 'concrete'
      ? Math.max(1, width / MM_TO_UNIT / WALL_TEXTURE_WIDTH_MM)
      : usesImageTexture
        ? Math.max(1, width / MM_TO_UNIT / imageTextureSize.widthMm)
        : Math.max(1, width / MM_TO_UNIT / WALL_TEXTURE_HEIGHT_MM);
  const textureRepeatY = usesImageTexture
    ? Math.max(1, height / MM_TO_UNIT / imageTextureSize.heightMm)
    : 1;
  const geometry = useMemo(() => {
    const boxGeometry = new THREE.BoxGeometry(width, height, depth);
    const uv = boxGeometry.getAttribute('uv');

    if (uv) {
      boxGeometry.setAttribute('uv2', uv.clone());
    }

    return boxGeometry;
  }, [depth, height, width]);

  return (
    <mesh geometry={geometry}>
      {usesImageTexture ? (
        <ImageWallMaterial
          color={color}
          texture={texture}
          textureRepeatX={textureRepeatX}
          textureRepeatY={textureRepeatY}
        />
      ) : (
        <ProceduralWallMaterial
          color={color}
          texture={texture}
          textureRepeatX={textureRepeatX}
          textureRepeatY={textureRepeatY}
        />
      )}
    </mesh>
  );
}

function SegmentedGroundOcclusion({
  width,
  depth,
  centerX,
  centerZ,
  segments,
  settings,
}: GroundOcclusionProps & { segments: GroundShadowSegment[] }) {
  const shadowOutset = Math.max(0, settings.spread) + settings.blur;
  const footprintWidth = width + Math.abs(settings.xOffset) + shadowOutset * 2;
  const footprintDepth = depth + Math.abs(settings.yOffset) + shadowOutset * 2;
  const footprintCenterX = centerX + settings.xOffset / 2;
  const footprintCenterZ = centerZ + settings.yOffset / 2;
  const localSegments = useMemo(
    () =>
      segments.map((segment) => ({
        ...segment,
        centerX: segment.centerX - footprintCenterX,
        centerZ: segment.centerZ - footprintCenterZ,
      })),
    [footprintCenterX, footprintCenterZ, segments],
  );
  const occlusionAlphaMap = useMemo(
    () => makeGroundOcclusionAlphaMap(footprintWidth, footprintDepth, localSegments, settings),
    [footprintDepth, footprintWidth, localSegments, settings],
  );

  return (
    <mesh position={[footprintCenterX, 0.018, footprintCenterZ]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <planeGeometry args={[footprintWidth, footprintDepth]} />
      <meshBasicMaterial
        color={settings.color}
        alphaMap={occlusionAlphaMap ?? undefined}
        transparent
        opacity={settings.opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

const SolidBlock = memo(function SolidBlock({
  visualThicknessMm,
  centerVisualMm,
  color,
  widthMm,
  heightMm,
  centerXMm = 0,
  texture,
  onSelect,
}: SolidBlockProps) {
  const width = widthMm * MM_TO_UNIT;
  const height = heightMm * MM_TO_UNIT;
  const depth = visualThicknessMm * MM_TO_UNIT;
  const x = centerXMm * MM_TO_UNIT;
  const z = centerVisualMm * MM_TO_UNIT;

  return (
    <group
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = '';
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (event.delta > CLICK_DRAG_THRESHOLD_PX) {
          return;
        }
        onSelect?.();
      }}
    >
      <group position={[x, height / 2, z]}>
        <WallBox width={width} height={height} depth={depth} color={color} texture={texture} />
      </group>
      <lineSegments position={[x, height / 2, z]}>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
        <lineBasicMaterial color="#2b2f35" transparent opacity={0.22} />
      </lineSegments>
    </group>
  );
});

function LayerGroupCallout({
  title,
  layers,
  centerXMm,
  widthMm,
  heightMm,
}: LayerGroupCalloutProps) {
  if (layers.length === 0) {
    return null;
  }

  const centerX = centerXMm * MM_TO_UNIT;
  const width = widthMm * MM_TO_UNIT;
  const height = heightMm * MM_TO_UNIT;
  const labelX = centerX;
  const labelY = height + 1.35;
  const labelZ = Math.max(...layers.map((layer) => layer.centerVisualMm + layer.visualThicknessMm / 2)) * MM_TO_UNIT + 0.55;
  const lineEndY = labelY - 0.32;
  const anchorZ = Math.max(...layers.map((layer) => layer.centerVisualMm + layer.visualThicknessMm / 2)) * MM_TO_UNIT / 2;

  return (
    <group>
      <Line
        points={[
          [centerX, height, anchorZ],
          [centerX, height + 0.52, labelZ - 0.22],
          [labelX, lineEndY, labelZ],
        ]}
        color="#25313d"
        transparent
        opacity={0.4}
        lineWidth={1.15}
      />
      <Html
        position={[labelX, labelY, labelZ]}
        center
        distanceFactor={30}
        className="viewer-label viewer-label--group"
      >
        <div className="viewer-label-card">
          <strong>{title}</strong>
          <ol>
            {layers.map((layer) => (
              <li key={`callout-item-${layer.renderId}`}>
                <span>{layer.name}</span>
                <em>{formatMm(layer.thicknessMm)}</em>
              </li>
            ))}
          </ol>
        </div>
      </Html>
    </group>
  );
}

function RoomSurfaces({ width, height, depth }: RoomSurfacesProps) {
  const roomDepth = Math.max(depth + 95, 110);
  const roomWidth = Math.max(width + 70, 120);
  const centerZ = depth / 2;
  const floorMap = useMemo(() => makeInfinitySurfaceTexture('#f1f2f1', '#f8f8f6', 'floor'), []);

  return (
    <group>
      <mesh position={[0, -0.035, centerZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial
          color="#ffffff"
          map={floorMap ?? undefined}
          roughness={0.78}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function SoundWaveOverlay({
  mode,
  settings,
  oldCenterX,
  newCenterX,
  zoneWidth,
  height,
  oldDepth,
  newDepth,
}: SoundWaveOverlayProps) {
  const groupRef = useRef<THREE.Group>(null);
  const waveCount = 8;
  const activeDepth = mode === 'new' ? newDepth : oldDepth;
  const activeCenterX = mode === 'new' ? newCenterX : oldCenterX;
  const sourceZ = activeDepth + 70 * MM_TO_UNIT;
  const originY = height * 0.5;
  const maxRadius = Math.min(zoneWidth * 0.48, height * 0.46);
  const minRadius = maxRadius * 0.08;
  const waveColor = mode === 'old' ? settings.oldColor : settings.newColor;

  useFrame(({ clock }) => {
    if (!groupRef.current || mode === 'off') {
      return;
    }

    const elapsed = clock.getElapsedTime();
    groupRef.current.children.forEach((child, index) => {
      const progress = (elapsed * settings.speed + index / waveCount) % 1;
      const radius = minRadius + progress * (maxRadius - minRadius);
      child.scale.setScalar(radius);
      child.position.y = originY;
      child.position.z = sourceZ + progress * settings.depth;
      const material = (child as THREE.Mesh).material;

      if (material instanceof THREE.MeshBasicMaterial) {
        material.opacity = Math.max(0, settings.opacity * (1 - progress));
      }
    });
  });

  if (mode === 'off') {
    return null;
  }

  return (
    <group ref={groupRef} position={[activeCenterX, 0, 0]}>
      {Array.from({ length: waveCount }).map((_, index) => (
        <mesh key={index}>
          <ringGeometry args={[0.92, 1, 96]} />
          <meshBasicMaterial
            color={waveColor}
            transparent
            opacity={settings.opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.NormalBlending}
          />
        </mesh>
      ))}
      <Html
        position={[zoneWidth * 0.34, height * 0.88, sourceZ]}
        center
        distanceFactor={13}
        className="sound-label"
      >
        Geluid door {mode === 'new' ? 'nieuwe' : 'huidige'} muur
      </Html>
    </group>
  );
}

function Scene({
  data,
  widthMm,
  heightMm,
  showLabels,
  minVisualThicknessMm,
  groundShadow,
  soundMode,
  soundWave,
  onSoundModeChange,
}: Required<Pick<WallAssemblyViewportProps, 'widthMm' | 'heightMm' | 'showLabels' | 'minVisualThicknessMm'>> & {
  data?: WallAssemblyInput;
  groundShadow: GroundShadowSettings;
  soundMode: SoundMode;
  soundWave: SoundWaveSettings;
  onSoundModeChange?: (mode: SoundMode) => void;
}) {
  const fallbackThicknessMm = 180;
  const halfWidthMm = widthMm / 2;
  const leftCenterXMm = -widthMm / 4;
  const rightCenterXMm = widthMm / 4;

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
      const visibleStack = visibleLayers(layers);
      return visibleStack.map((layer) => {
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
      ...buildStack(data.newWall.layers, rightCenterXMm, halfWidthMm, 'new'),
    ];
  }, [data, halfWidthMm, leftCenterXMm, minVisualThicknessMm, rightCenterXMm]);

  const totalVisualMm = Math.max(
    ...renderLayers.map((layer) => layer.centerVisualMm + layer.visualThicknessMm / 2),
    fallbackThicknessMm,
  );
  const totalWidth = widthMm * MM_TO_UNIT;
  const totalHeight = heightMm * MM_TO_UNIT;
  const totalDepth = Math.max(totalVisualMm, fallbackThicknessMm) * MM_TO_UNIT;
  const maxSceneDimension = Math.max(totalWidth, totalHeight, totalDepth);
  const cameraDistance = maxSceneDimension * 1.25;
  const oldStackVisualDepthMm = data
    ? visibleLayers(data.existingWall.layers).reduce(
        (sum, layer) => sum + Math.max(layer.thicknessMm, minVisualThicknessMm),
        0,
      )
    : fallbackThicknessMm;
  const newStackVisualDepthMm = data
    ? visibleLayers(data.newWall.layers).reduce(
        (sum, layer) => sum + Math.max(layer.thicknessMm, minVisualThicknessMm),
        0,
      )
    : fallbackThicknessMm;
  const oldRenderLayers = renderLayers.filter((layer) => layer.renderId.startsWith('old-'));
  const newRenderLayers = renderLayers.filter((layer) => layer.renderId.startsWith('new-'));

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
      <Environment files="/hdri/studio_small_03_1k.hdr" environmentIntensity={0.46} />
      <ambientLight intensity={0.1} />
      <hemisphereLight args={['#ffffff', '#cfc6ba', 0.28]} />
      <directionalLight
        position={[-16, 19, 16]}
        intensity={2.18}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00015}
      />
      <directionalLight position={[12, 9, -10]} intensity={0.12} color="#f7fbff" />
      <group
        onClick={(event) => {
          event.stopPropagation();
          if (event.delta > CLICK_DRAG_THRESHOLD_PX) {
            return;
          }
          onSoundModeChange?.('off');
        }}
      >
        <RoomSurfaces width={totalWidth} height={totalHeight} depth={totalDepth} />

        <SoundWaveOverlay
          mode={soundMode}
          settings={soundWave}
          oldCenterX={leftCenterXMm * MM_TO_UNIT}
          newCenterX={rightCenterXMm * MM_TO_UNIT}
          zoneWidth={halfWidthMm * MM_TO_UNIT}
          height={totalHeight}
          oldDepth={oldStackVisualDepthMm * MM_TO_UNIT}
          newDepth={newStackVisualDepthMm * MM_TO_UNIT}
        />

        <SegmentedGroundOcclusion
          width={totalWidth}
          depth={Math.max(oldStackVisualDepthMm, newStackVisualDepthMm) * MM_TO_UNIT}
          centerX={0}
          centerZ={(Math.max(oldStackVisualDepthMm, newStackVisualDepthMm) * MM_TO_UNIT) / 2}
          segments={[
            {
              width: halfWidthMm * MM_TO_UNIT,
              depth: oldStackVisualDepthMm * MM_TO_UNIT,
              centerX: leftCenterXMm * MM_TO_UNIT,
              centerZ: (oldStackVisualDepthMm * MM_TO_UNIT) / 2,
            },
            {
              width: halfWidthMm * MM_TO_UNIT,
              depth: newStackVisualDepthMm * MM_TO_UNIT,
              centerX: rightCenterXMm * MM_TO_UNIT,
              centerZ: (newStackVisualDepthMm * MM_TO_UNIT) / 2,
            },
          ]}
          settings={groundShadow}
        />
      </group>

      {renderLayers.map((layer) => (
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
          showLabel={false}
          onSelect={() => onSoundModeChange?.(layer.renderId.startsWith('old-') ? 'old' : 'new')}
        />
      ))}
      {showLabels && data ? (
        <>
          <LayerGroupCallout
            title={data.existingWall.title}
            layers={oldRenderLayers}
            centerXMm={leftCenterXMm}
            widthMm={halfWidthMm}
            heightMm={heightMm}
          />
          <LayerGroupCallout
            title={data.newWall.title}
            layers={newRenderLayers}
            centerXMm={rightCenterXMm}
            widthMm={halfWidthMm}
            heightMm={heightMm}
          />
        </>
      ) : null}
    </>
  );
}

function formatMm(value: number) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)} mm`;
}

export function WallAssemblyViewport({
  data,
  widthMm = DEFAULT_WIDTH_MM,
  heightMm = DEFAULT_HEIGHT_MM,
  showLabels = true,
  minVisualThicknessMm = DEFAULT_MIN_VISUAL_THICKNESS_MM,
  groundShadow = DEFAULT_GROUND_SHADOW,
  soundMode = 'off',
  onSoundModeChange,
  soundWave = DEFAULT_SOUND_WAVE,
}: WallAssemblyViewportProps) {
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);

  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      gl={{ preserveDrawingBuffer: true }}
      onPointerDown={(event) => {
        pointerDownRef.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerMissed={(event) => {
        const pointerDown = pointerDownRef.current;
        const dragDistance = pointerDown
          ? Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y)
          : 0;

        if (dragDistance <= CLICK_DRAG_THRESHOLD_PX) {
          onSoundModeChange?.('off');
        }
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.84;
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
    >
      <color attach="background" args={['#f8f8f6']} />
      <Scene
        data={data}
        widthMm={widthMm}
        heightMm={heightMm}
        showLabels={showLabels}
        minVisualThicknessMm={minVisualThicknessMm}
        groundShadow={groundShadow}
        soundMode={soundMode}
        onSoundModeChange={onSoundModeChange}
        soundWave={soundWave}
      />
    </Canvas>
  );
}
