import { useState } from 'react';
import { WallAssemblyViewer } from './components/WallAssemblyViewer';
import { demoWall } from './data/demoWall';

const phases = [
  { value: 1, label: 'Fase 1' },
  { value: 2, label: 'Fase 2' },
  { value: 3, label: 'Fase 3' },
] as const;

function App() {
  const [phase, setPhase] = useState<1 | 2 | 3>(3);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Constructiewand viewer</p>
          <h1>3D wandopbouw</h1>
        </div>
        <div className="phase-control" aria-label="Fase selectie">
          {phases.map((item) => (
            <button
              key={item.value}
              type="button"
              className={phase === item.value ? 'active' : ''}
              onClick={() => setPhase(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <WallAssemblyViewer
        data={demoWall}
        phase={phase}
        widthMm={6000}
        heightMm={2800}
        minVisualThicknessMm={24}
      />
    </main>
  );
}

export default App;
