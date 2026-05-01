# wallvisualizer3D

Een Vite + React + TypeScript applicatie om een constructiewand in 3D te bekijken en dynamisch op te bouwen.

De app toont twee situaties naast elkaar:

- `Huidige muur`
- `Nieuwe muur met voorzetwand`

Beide wanden worden volledig afzonderlijk opgebouwd. Dat is bewust zo gedaan, zodat de huidige en nieuwe situatie later los gebruikt kunnen worden voor simulaties, bijvoorbeeld audiovergelijking.

## Functionaliteit

- 3D viewport met `three`, `@react-three/fiber` en `@react-three/drei`.
- Wandafmetingen standaard op 6 meter breed en 2,8 meter hoog.
- Links de huidige muur, rechts de nieuwe muur met voorzetwand.
- Lagen worden individueel gerenderd met echte diktes, plus een minimale visuele dikte voor dunne lagen.
- Procedurele materiaalweergave voor kalkzandsteen, luchtspouw, steenwol en gipsplaat.
- Infinity-vloer met instelbare zachte box-shadow-achtige contactschaduw.
- Labels boven de constructie, optioneel te tonen of te verbergen.
- Geluidvisualisatie met geanimeerde ringen voor huidige of nieuwe muur.
- Klik op de huidige of nieuwe muur om de geluidvisualisatie naar die zijde te schakelen.
- Klik buiten de constructie om de geluidvisualisatie uit te zetten.
- Sidebar met tabs voor `Bouwen`, `Luisteren` en instellingen.
- Bouwen-tab om lagen toe te voegen, materiaal te kiezen, dikte te wijzigen, lagen te verwijderen en lagen te herschikken met drag-and-drop.
- Materiaalbibliotheek in de app opgeslagen.
- Screenshotknop voor de 3D viewport.

## Ontwikkeling

```bash
npm install
npm run dev
```

De lokale app draait op:

```text
http://127.0.0.1:5173
```

## Scripts

```bash
npm run dev
npm run build
npm test
```

`npm run build` geeft momenteel een Vite waarschuwing dat de JavaScript chunk groter is dan 500 kB. Dat komt vooral door de Three.js stack en is op dit moment bekend en niet blokkerend.

## Projectstructuur

```text
src/
  App.tsx
  types.ts
  components/
    WallAssemblyViewport/
      WallAssemblyViewport.tsx
    Sidebar/
      ComposerPanel.tsx
      DisplayControls.tsx
      SettingsPanel.tsx
      ShadowControls.tsx
      Sidebar.tsx
      SidebarTabs.tsx
      SimulatorPanel.tsx
      SoundControls.tsx
  data/
    demoWall.ts
    materialLibrary.ts
  lib/
    format.ts
    wallGeometry.ts
```

## Data model

```ts
type WallAssemblyInput = {
  existingWall: WallSection;
  newWall: WallSection;
};

type WallSection = {
  title: string;
  layers: WallLayer[];
};

type WallLayer = {
  id: string;
  name: string;
  material: string;
  thicknessMm: number;
  color: string;
  texture?: string;
  visible?: boolean;
};
```

`visible: false` lagen worden niet meegenomen in de 3D-rendering en geometrieberekeningen.

## Materiaalbibliotheek

Materialen staan in `src/data/materialLibrary.ts`. Een materiaal bevat:

- `id`
- `name`
- `material`
- `defaultThicknessMm`
- `color`
- `texture`

De composer gebruikt deze bibliotheek voor het toevoegen van nieuwe lagen en voor de materiaal-dropdown per laag.

## Componenten

### `WallAssemblyViewport`

De 3D viewport. Deze component rendert alleen de scene en kent geen sidebar-logica.

Belangrijke props:

```ts
type WallAssemblyViewportProps = {
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
```

### `Sidebar`

Container voor de tab-inhoud. De tabs zelf staan erboven in `SidebarTabs`.

Tabs:

- `Bouwen`: lagen beheren.
- `Luisteren`: placeholder voor toekomstige luister- en simulatiefunctionaliteit.
- Instellingen: labels, screenshot, geluidvisualisatie en schaduw.

## Tests

Er zijn unit tests voor:

- formattering;
- laagfiltering en dikteberekeningen;
- materiaalbibliotheek helpers.

Run:

```bash
npm test
```
