# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## Drawing Canvas (Konva) — Overview

This app includes an interactive drawing canvas implemented with React Konva. The feature is composed of small, focused components under `src/components/drawing/` and a single orchestrator component `src/components/DimensionedPolygon.tsx` that wires state and events.

### Key files

- `src/components/DimensionedPolygon.tsx`: Main canvas component. Holds state for rectangles, images ("sinks"), infinite divider lines, zoom/pan, context menu, and dialogs. Renders layers and delegates UI to subcomponents.
- `src/components/drawing/types.ts`: Shared TypeScript types (points, rectangles, images, modes, context menu, etc.). Avoid `any` in this codebase.
- `src/components/drawing/constants.ts`: All constants and options (sizes, tolerances, zoom bounds, color palette, image presets, stage size).
- `src/components/drawing/Toolbar.tsx`: Top toolbar (zoom in/out, spawn/clear rectangles, mode switch, default colors, tool selection, image preset selection).
- `src/components/drawing/ContextMenu.tsx`: Popover shown on edge/corner/inside-rect interactions. Lets you pick edge/corner colors or add a sink.
- `src/components/drawing/URLImage.tsx`: Konva image node with container-space drag bounds so it stays inside its parent rect under any pan/zoom.
- `src/components/drawing/InfoLog.tsx`: Optional diagnostics panel summarizing stage/rects/images/lines and groupings.
- `src/components/drawing/DistanceModal.tsx`: Modal dialog to set a sink’s distance from a rect’s left edge in pixels.

### Interaction model

- Tools:
  - Rectangle: click-drag (desktop) or long-press then drag (touch) to create a rect. Size snaps to 100×100 when near default.
  - Image: click/tap to place a sink image. If added via context menu inside a rect, it becomes a child of that rect.
- Modes:
  - Edge: right-click/tap edges to open the color menu; drag rects by clicking inside them (images don’t start dragging this drag).
  - Corner: right-click/tap corners to open corner color menu.
  - Sink: right-click/tap inside a rect to open a "Add Sink" action at the clicked position.
  - Line: click to add an infinite vertical line; hold Alt/Option to add a horizontal line.
- Pan/Zoom:
  - Hold Shift + drag to pan. Mouse wheel to zoom under pointer; pinch to zoom on touch. Position and scale persist in state.

### Layers

Rendering is split to keep performance high:
- FastLayer for rect strokes/corners (no hit graph/listeners).
- Layer for images (interactive Konva nodes).
- Layer for labels/draft rectangle and infinite guide lines.
- Layer for clickable sink-distance labels.

### State and IDs

- IDs are generated with counters for stable keys: `rect-<n>`, `img-<n>`, `line-<n>`.
- Rects always store `edges` and `corners` colors; defaults controlled from the toolbar.
- Sinks (images) track an optional `parentRectId`. If present, drag bounds keep the sink constrained to its parent rect.

### Extending

- Add new tools or modes by updating the `ToolMode`/`InteractionMode` types and branching in handlers (`handleMouseDown`, etc.).
- Add new context menu actions inside `ContextMenu.tsx` and route to the main component via callbacks.
- For persistence, serialize `rects`, `images`, and `lines` to localStorage or URL query params; restore them in `useEffect`.

### Development tips

- Keep math conversions explicit: use `toScene` for container→scene and mirrored helpers in `URLImage.tsx` for drag bounding.
- Prefer container-space math for interactions that must ignore pan/zoom.
- Don’t remove comments in code; they capture intent and constraints.
- Avoid `any` in TypeScript; extend the shared types in `types.ts` instead.

### Sink dragging and drop constraints

- Free drag: sinks (images) can be dragged freely without edge clamping during the gesture.
- Valid drop: a drop is accepted only if the sink’s center lands inside a rectangle. The sink then attaches to that rect (`parentRectId` updated) and its final `x/y` are committed.
- Invalid drop: if the sink is dropped outside all rectangles, it snaps back to the drag-start position and original parent.
- Visual feedback during drag:
  - The canvas darkens outside all rectangles.
  - The current candidate rectangle (under the sink center) is outlined in orange.

Implementation notes (for contributors):
- `URLImage.tsx` no longer clamps movement via `dragBoundFunc`. Instead it emits `onSinkDragStart/onSinkDragMove/onSinkDragEnd`.
- `DimensionedPolygon.tsx` orchestrates the gesture:
  - On drag start, it snapshots the sink’s position/parent in `sinkDragStartRef` and sets `sinkDrag` UI state.
  - On drag move, it hit-tests the sink center against rects to compute `candidateRectId`.
  - On drag end, it accepts the drop if inside a rect; otherwise reverts using the snapshot. It also explicitly resets the Konva node’s position to prevent visual drift.
- The overlay is a `Layer` with a large semi-opaque `Rect` and `destination-out` holes for rects; the candidate rect is drawn with an orange stroke.


### Layout design and data flow
 - Drawing context 
    - Holds information about active tab (+ uses nuqs)
    - Holds information about zoom level
    
    - Also SHOULD hold information about right side dialog window (isOpen), since we want to close it when changing tabs ?
    - Also SHOULD hold information about cursor type ? (text, edges, dimesions, copy, corners, duplicate mode, etc..)
        - Should be reset when tabs change
        - If we have this we can easily know what SD to open when tab === Shape and cursor === curves & bumps || corners
    
    - Undo / Redo buttons, where is the stack? 