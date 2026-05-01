# Changelog

Alle noemenswaardige wijzigingen aan dit project worden in dit bestand bijgehouden.

## Unreleased

### Toegevoegd

- Dynamische composer voor `Huidige muur` en `Nieuwe muur met voorzetwand`.
- Materiaalbibliotheek in `src/data/materialLibrary.ts`.
- Lagen toevoegen vanuit een materiaal-dropdown.
- Materiaal per laag wijzigen.
- Dikte per laag wijzigen met ondersteuning voor komma-decimalen.
- Lagen verwijderen.
- Lagen herschikken met drag-and-drop en een zichtbare drop-indicator.
- Screenshotknop voor de 3D viewport.

### Gewijzigd

- De oude gefaseerde viewer is vervangen door een app-structuur met een losse 3D viewport en losse sidebar-componenten.
- `WallAssemblyViewer` is opgesplitst; de 3D scene leeft nu in `WallAssemblyViewport`.
- De sidebar heeft tabs voor `Bouwen`, `Luisteren` en instellingen.
- `Huidige muur` en `Nieuwe muur met voorzetwand` worden als twee afzonderlijke constructies opgebouwd.
- Sidebar-secties zijn vormgegeven als losse panelen zonder buitenste containerkaart.
- Dropdowns en inputs zijn compacter en rustiger vormgegeven.
- Diktevelden zijn rechts uitgelijnd en normaliseren voorloopnullen.

### Gecontroleerd

- `npm test` draait groen.
- `npm run build` draait groen.
- De bekende Vite chunk-size waarschuwing blijft bestaan door de Three.js bundle.

## v1.1

### Toegevoegd

- Unit tests voor formattering, laaggeometrie en materiaalhelpers.

### Gewijzigd

- Refactor van de app-layout naar losse componenten voor viewport en sidebar.
- Sidebar-tabstructuur met `Bouwen`, `Luisteren` en instellingen.

## v1.0

### Toegevoegd

- Eerste bruikbare 3D constructiewandviewer.
- Rendering van huidige en nieuwe wand als twee helften van een 6 meter brede constructie.
- 2,8 meter wandhoogte.
- Individuele laagblokken met kleuren, diktes en procedurele textures.
- Orbit controls met muiswiel-zoom.
- Infinity-vloer.
- Zachte, instelbare contactschaduw op de vloer.
- Labels boven de constructie.
- Geluidvisualisatie met geanimeerde ringen.
