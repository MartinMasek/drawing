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

### Layout design and data flow
  #### Drawing context 
  - Holds information about active tab (+ uses nuqs)
  - Holds information about zoom level
  - Holds information if right side dialog window is open (closes on tab change)
  - Holds information about cursor type (text, edges, dimesions, copy, corners, duplicate mode, etc..)
      - Resets on tab change (to default per tab)
  
  
  - Undo / Redo buttons, where is the stack? 