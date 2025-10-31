## Getting started (step-by-step)

1. Install dependencies
```bash
npm install
```

2. Start the database (local Postgres)
```bash
./start-database.sh
```
Make sure your `.env` has `DATABASE_URL` pointing to this Postgres instance.

3. Generate Prisma client
```bash
npx prisma generate
```

4. Seed sample data (optional)
```bash
npm run db:seed
```

5. Start the dev server
```bash
npm run dev
```

## Useful commands

- Lint (check only) / auto-fix
```bash
npm run check
npm run check:write
```

- Open Prisma Studio
```bash
npm run db:studio
```

- Reset database (drops, re-applies migrations, then seeds)
```bash
npm run db:reset
```

- Reset database without seeding
```bash
npm run db:reset:noseed
```

- Seed database only
```bash
npm run db:seed
```

## Drawing Canvas (Konva) — Overview

Right now we have 2 versions of the drawing canvas:
- `src/components/DimensionedPolygon.tsx` (old)
- `src/components/DrawingCanvas.tsx` (new)

all old components are in `src/components/drawing-old/` they will be removed in the future.

### Canvas Interactions
The new canvas (`DrawingCanvas.tsx`) provides simple pan and zoom navigation:

**Zoom:**
- Mouse wheel to zoom in/out
- Zoom is centered on cursor position
- Current zoom level syncs with the header zoom controls

**Pan:**
- Middle-click + drag  
- Shift + left-click + drag

All interaction state is managed in `DrawingContext` - the canvas component itself is stateless and uses the `useCanvasNavigation` hook for event handlers.

**Configuration:**
- Zoom speed, min/max zoom levels, and button mappings are configured in `src/utils/canvas-constants.ts`

### Layers

Rendering is split to keep performance high:
- FastLayer for rect strokes/corners (no hit graph/listeners).
- Layer for images (interactive Konva nodes).
- Layer for labels/draft rectangle and infinite guide lines.
- Layer for clickable sink-distance labels.

## Data architecture

- **Design**: top-level drawing document. Holds metadata like `name` and contains multiple shapes.
- **Shape**: a polygon with an origin (`xPos`, `yPos`), `rotation`, and a set of ordered `points`.
- **Point**: 2D coordinate in shape-local space. Used to render polylines/polygons.
- **Edge/Corner/Cutout**: optional per-shape details for fabrication (profiles, radii, sinks, etc.). Some are placeholders and will evolve.
- **API mapping**: the `design.getById` route selects only fields required for rendering and returns `CanvasShape[]` (minimal shape type for the canvas).
- **Storage**: persisted via Prisma models (`Design`, `Shape`, `Point`, `Edge`, `Cutout`, related configs). IDs are `cuid()` strings.

This is an initial cut of the data model focused on getting drawings onto the canvas quickly. It will be extended and refined as interactions (corners, edges, sinks, services) are implemented.

## Shapes
For more information about shapes and how they are rendered look at the `src/components/shape/README.md` file.

### Layout design and data flow
  #### Drawing context 
  - Holds information about active tab (+ uses nuqs)
  - Holds information about zoom level
  - Holds information if right side dialog window is open (closes on tab change)
  - Holds information about cursor type (text, edges, dimesions, copy, corners, duplicate mode, etc..)
      - Resets on tab change (to default per tab)
  
  
  - Undo / Redo buttons, where is the stack? 

### Cursors overview
  - Tab 1 - Dimensions
    - Default cursor -> custom pencil
    - On shape / text hover -> cursor pointer
    - On edge hover -> cursor resize

  - Tab 2 - Shape
    - Default cursor –> normal arrow
    - On text hover -> cursor pointer
    - On corner hover -> cursor pointer
    - Inside shape -> move shape

  - Tab 3 - Edges
    - Default cursor –> normal arrow
    - On text hover -> cursor pointer
    - On edge hover -> cursor pointer
    - Inside shape -> move shape

  - Tab 4 - Cutouts
    - Default cursor –> normal arrow
    - On text hover -> cursor pointer
    - Inside shape -> 'add' cursor
      - Inside sink etc.. -> move cursor
    
  - Tab 5 - Layout
    - TBD.

  - Tab 6 - Quote
    - TBD.

  - Text cursor 
    - Ignore all shapes 
    - On text hover -> pointer

  - Area cursor
    - TBD.

  - Package cursor
    - TBD.