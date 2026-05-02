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

export type MaterialType = 'solid_panel' | 'air_gap' | 'porous_fill' | 'thin_layer';

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  density?: number;
  lossFactor?: number;
  flowResistivity?: number;
  typicalThicknessesMm: number[];
  uiCategory: string;
  notes?: string;
}

export type MaterialDefinition = Material;

export type GroundShadowSettings = {
  opacity: number;
  xOffset: number;
  yOffset: number;
  blur: number;
  spread: number;
  color: string;
};

export type ListenMode = 'source' | 'existing' | 'new';
export type SoundMode = ListenMode;

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
