# AGENTS.md

Richtlijnen voor agents die aan dit project werken.

## Project

Dit is een Vite + React + TypeScript app voor het visualiseren en samenstellen van constructiewanden in 3D.

De app is geen losse single-component demo meer. Behandel het als een kleine applicatie met duidelijke scheiding tussen:

- 3D viewport;
- sidebar;
- composer;
- instellingen;
- data en utility functies.

## Belangrijke bestanden

- `src/App.tsx`: applicatiestate en wiring tussen viewport en sidebar.
- `src/components/WallAssemblyViewport/WallAssemblyViewport.tsx`: alleen de 3D scene.
- `src/components/Sidebar/ComposerPanel.tsx`: dynamische muuropbouw-editor.
- `src/components/Sidebar/SettingsPanel.tsx`: instellingen-tab.
- `src/components/Sidebar/SoundControls.tsx`: geluidvisualisatie-instellingen.
- `src/components/Sidebar/ShadowControls.tsx`: schaduw-instellingen.
- `src/data/materialLibrary.ts`: materiaalbibliotheek.
- `src/data/demoWall.ts`: startdata.
- `src/lib/wallGeometry.ts`: laagfiltering en dikteberekeningen.
- `src/styles.css`: globale app-styling.

## Architectuurregels

- Houd `WallAssemblyViewport` vrij van sidebar- en composerlogica.
- Houd materiaaldefinities in `src/data/materialLibrary.ts`.
- Houd gedeelde types in `src/types.ts`.
- Voeg utility logic toe in `src/lib` wanneer die los testbaar is.
- Houd de huidige en nieuwe muur afzonderlijk opgebouwd. Voeg niet automatisch lagen van de huidige muur toe aan de nieuwe muur in de renderlogica.
- Respecteer `visible: false` via de bestaande geometry/helpers.

## UI-richtlijnen

- De eerste viewport is de werkelijke app, geen landingpage.
- De 3D scene blijft links, de sidebar rechts op desktop.
- Sidebar-tabs staan boven de sidebar-panelen.
- Sidebar-panelen zijn losse blokken; gebruik geen extra containerkaart om alle panelen heen.
- Composer-lagen zijn platte rijen met separators binnen een muurpanel, geen losse kaart per laag.
- Dikte-inputs zijn compact en rechts uitgelijnd.
- Selects gebruiken een custom dropdown-pijl via CSS.
- Gebruik bestaande rustige kleur- en borderstijl: `#c6d0d8` voor hoofdpanelen, viewport en tabs.

## 3D-richtlijnen

- Breedte is horizontaal, hoogte verticaal, wanddikte in diepte.
- Standaardconstructie is 6000 mm breed en 2800 mm hoog.
- Links staat de huidige muur, rechts de nieuwe muur met voorzetwand.
- Dunne lagen moeten zichtbaar blijven via `minVisualThicknessMm`.
- Gebruik echte diktes in labels en berekeningen.
- Houd orbit/zoom soepel.

## Tests en verificatie

Run na relevante wijzigingen:

```bash
npm test
npm run build
```

Bekend: `npm run build` geeft een Vite waarschuwing over chunks groter dan 500 kB. Dat is op dit moment acceptabel.

Gebruik de browser voor visuele wijzigingen aan:

- sidebar-layout;
- drag-and-drop;
- labels;
- 3D viewport;
- geluidvisualisatie;
- schaduw.

## Git en bestanden

- Revert geen wijzigingen die je niet zelf hebt gemaakt.
- Laat tijdelijke browserbestanden en screenshots buiten commits. Ze staan in `.gitignore`.
- Commit of tag alleen wanneer de gebruiker daar expliciet om vraagt.
