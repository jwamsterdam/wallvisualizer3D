# wallvisualizer3D

Display the composition of a wall in 3D as a React component.

## Development

```bash
npm install
npm run dev
```

The local app runs at `http://127.0.0.1:5173`.

## Component

`WallAssemblyViewer` accepts wall data through props and can render three build phases:

- `phase={1}`: one simple 3D wall block.
- `phase={2}`: existing wall and new wall as two combined section blocks.
- `phase={3}`: all visible layers rendered individually.

```tsx
<WallAssemblyViewer
  data={wallData}
  phase={3}
  widthMm={2600}
  heightMm={1600}
  minVisualThicknessMm={24}
/>
```

Layers with `visible: false` are excluded from rendering and thickness totals.
