export type WallAssemblyInput = {
  existingWall: WallSection;
  newWall: WallSection;
};

export type WallSection = {
  title: string;
  layers: WallLayer[];
};

export type WallLayer = {
  id: string;
  name: string;
  material: string;
  thicknessMm: number;
  color: string;
  texture?: string;
  visible?: boolean;
};

export type MaterialDefinition = {
  id: string;
  name: string;
  material: string;
  defaultThicknessMm: number;
  color: string;
  texture?: string;
};

export type GroundShadowSettings = {
  opacity: number;
  xOffset: number;
  yOffset: number;
  blur: number;
  spread: number;
  color: string;
};

export type SoundMode = 'off' | 'old' | 'new';

export type SoundWaveSettings = {
  speed: number;
  depth: number;
  opacity: number;
  oldColor: string;
  newColor: string;
};

export type WallAssemblyViewportProps = {
  data?: WallAssemblyInput;
  widthMm?: number;
  heightMm?: number;
  showLabels?: boolean;
  minVisualThicknessMm?: number;
  groundShadow?: GroundShadowSettings;
  soundMode?: SoundMode;
  onSoundModeChange?: (mode: SoundMode) => void;
  soundWave?: SoundWaveSettings;
};
