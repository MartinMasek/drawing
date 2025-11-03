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

Main drawing canvas:
- `src/components/DrawingCanvas.tsx`

### Canvas Interactions
The canvas (`DrawingCanvas.tsx`) provides simple pan and zoom navigation:

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

### Sheets

Sheets are side panel UI components that display detailed editing interfaces for selected entities on the canvas. They are conditionally rendered based on the active tab/cursor type and provide interactive controls for modifying shape properties, edges, corners, cutouts, and materials.

**Location:** `src/components/sheets/`

**Structure:**
- Each sheet is a React component wrapped in `SheetContent` from the UI library
- Sheets prevent interaction with the canvas while open (`onInteractOutside` prevents default behavior)
- They access selection state via `ShapeContext` (`useShape()` hook)
- The active sheet is determined by `cursorType` from `DrawingContext`

**Available Sheets:**
- **ShapeSheet** (`shape/ShapeSheet.tsx`) - For editing curves and corners
  - Shows overview views (`generalCurves`, `generalCorners`) and edit views (`editCurves`, `editCorners`)
  - Dynamically switches between curve and corner editing based on selection
  - Used when cursor type is `Curves` or `Corners`

- **EdgeSheet** (`edge/EdgeSheet.tsx`) - For edge configuration
  - Used when cursor type is `Edges`

- **CutoutSheet** (`cutout/CutoutSheet.tsx`) - For sink/cutout parameters
  - Shows cutout type, shape, size, faucet holes, and centerline inputs
  - Includes actions: Save as Template, Duplicate, Remove
  - Used when cursor type is `Cutouts`

- **MaterialSheet** (`material/MaterialSheet.tsx`) - For material management
  - Shows overview, add material, and edit material views
  - Displays material assignments and package breakdowns
  - Used when cursor type is `Dimensions`

**Sheet Rendering:**
Sheets are rendered in `SidePanel.tsx` based on the current `cursorType`. The panel opens/closes via `isOpenSideDialog` state in `DrawingContext`, and automatically closes when switching tabs.

**Interaction Pattern:**
1. User selects an entity (shape, edge, corner, cutout) on the canvas
2. Selection is stored in `ShapeContext` (via `setSelectedShape`, `setSelectedEdge`, etc.)
3. Sheet component reads selection via `useShape()` hook
4. Sheet displays relevant inputs and calls mutation hooks on changes
5. Mutations update both the cache and selected context state optimistically

### Data updates

All data mutations follow a consistent optimistic update pattern using React Query (tRPC). Mutations are organized by feature in `src/hooks/mutations/`.

**Location:** `src/hooks/mutations/`

**Mutation Pattern:**

All mutations implement three lifecycle callbacks:

1. **`onMutate`** (Optimistic Update):
   - Cancels any outgoing refetches to prevent race conditions
   - Snapshots the previous cache state for rollback
   - Immediately updates the cache with optimistic data
   - Updates relevant selected state in `ShapeContext` (e.g., `selectedShape`, `selectedEdge`, `selectedCorner`, `selectedCutout`)
   - For create operations, generates temporary IDs (e.g., `temp-${Date.now()}`)
   - Returns context object with `previousData` and any temp IDs for later use

2. **`onError`** (Rollback):
   - Reverts the cache to the previous state using the snapshot from `onMutate`
   - Ensures UI reflects actual data state on failure

3. **`onSuccess`** (only used for create operations) (Server Sync):
   - Replaces temporary IDs with real server-generated IDs (for create operations)
   - Updates cache with complete server response (may include calculated fields like edge indices, points)
   - Syncs selected context state with updated IDs
   - For creates: Links the created entity by replacing temp ID in `selectedShape`, `selectedEdge`, etc.

**Special Considerations:**

**Temporary IDs:**
- Create mutations use temporary IDs (e.g., `temp-cutout-${Date.now()}`) for immediate UI feedback
- These are replaced with real database IDs in `onSuccess` callbacks
- The `clientId` field on shapes prevents React remounting during temp→real ID transition

**Debounced Updates:**
- Input-heavy mutations (like radius, depth, size changes) use debouncing to reduce server load
- Pattern: Immediate optimistic update + debounced server mutation (see `useUpdateCornerRadiusDebounced`, `useUpdateEdgeModificationDebounced`)
- Debounce delay configured in `src/utils/canvas-constants.ts` (`DEBOUNCE_DELAY`)

**Context State Updates:**
- Mutations update both the cache (`utils.design.getById.setData`) and context state (`setSelectedShape`, `setSelectedEdge`, etc.)
- This ensures sheets and canvas stay in sync
- Create mutations must update context in `onMutate` for immediate feedback, then re-link in `onSuccess` with real IDs

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