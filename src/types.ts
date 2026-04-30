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

export type GroundShadowSettings = {
  opacity: number;
  xOffset: number;
  yOffset: number;
  blur: number;
  spread: number;
  color: string;
};

export type SoundMode = 'off' | 'old' | 'new';

export type WallAssemblyViewerProps = {
  data?: WallAssemblyInput;
  widthMm?: number;
  heightMm?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  minVisualThicknessMm?: number;
  phase?: 1 | 2 | 3;
  groundShadow?: GroundShadowSettings;
  onGroundShadowChange?: (settings: GroundShadowSettings) => void;
  soundMode?: SoundMode;
  onSoundModeChange?: (mode: SoundMode) => void;
};
