# Drawing Canvas Architecture - How It All Works

## Table of Contents
1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Data Structure](#data-structure)
4. [Rendering Pipeline](#rendering-pipeline)
5. [File Organization](#file-organization)
6. [Component Hierarchy](#component-hierarchy)
7. [Shape Rendering Variants](#shape-rendering-variants)
8. [Calculation Flow](#calculation-flow)
9. [Modification Types](#modification-types)
10. [Complete Flow Examples](#complete-flow-examples)

---

## Overview

The Drawing Canvas is a sophisticated shape rendering system built with React and Konva.js. It allows users to draw custom polygons and apply various edge modifications (bumps, curves, clips, etc.) with real-time visual feedback and precise geometric calculations.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DrawingCanvas                        │
│  Main orchestrator component managing canvas state      │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
    ┌─────────┐           ┌─────────┐
    │  Shape  │ (many)    │  Text   │ (optional)
    └────┬────┘           └─────────┘
         │
         │ (Renders different variants based on activeTab)
         │
    ┌────┴────────────────────────────────┐
    │                                     │
    ▼                                     ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ShapeShape   │  │ EdgesShape   │  │DimensionsShape│
│ (Shape Tab)  │  │ (Edges Tab)  │  │(Dimensions Tab)│
│              │  │              │  │              │
│Edges + Points│  │Edges Only    │  │Simple Path   │
└──────────────┘  └──────────────┘  └──────────────┘
    │
    └─ Edge Modifications
       (Bumps, Curves, Clips, etc.)
```

---

## Core Concepts

### 1. Shapes
A **Shape** is a closed polygon defined by vertices (points) in 2D space.

**Properties:**
- Position (x, y)
- Rotation
- Points (vertices)
- Edges (connections between points)
- Corners (optional modifications at vertices)

**Example:**
```typescript
{
  id: "shape-123",
  xPos: 100,
  yPos: 100,
  rotation: 0,
  points: [
    { id: "p1", xPos: 0, yPos: 0 },
    { id: "p2", xPos: 100, yPos: 0 },
    { id: "p3", xPos: 100, yPos: 100 },
    { id: "p4", xPos: 0, yPos: 100 }
  ]
}
```

### 2. Edges
An **Edge** is a line segment connecting two consecutive points of a shape.

**Properties:**
- Start point (point1Id)
- End point (point2Id)
- Edge modifications (list of modifications applied to this edge)

**Key Insight:** Edges are the fundamental building blocks of shape rendering. Each edge can be:
- A simple straight line
- Modified with bumps (in/out)
- Modified with curves
- Clipped at corners

### 3. Edge Modifications
**Edge Modifications** are geometric transformations applied to edges.

**Types:**
- `BumpIn` - Straight bump into the shape
- `BumpOut` - Straight bump out of the shape
- `BumpInCurve` - Smooth curve into the shape
- `BumpOutCurve` - Smooth curve out of the shape
- `FullCurve` - Curve spanning the entire edge
- `Clip` - Corner clipping
- `Radius` - Corner rounding

**Parameters:**
- `position` - Where along the edge (Left, Center, Right)
- `distance` - Distance from edge endpoint
- `depth` - How far the modification extends perpendicular to edge
- `width` - How wide the modification is along the edge
- `sideAngleLeft` / `sideAngleRight` - Angles for bump sides
- `fullRadiusDepth` - Depth for full curves

---

## Data Structure

### Complete Shape Data Model

```typescript
Shape {
  id: string
  xPos: number
  yPos: number
  rotation: number
  
  points: Point[] {
    id: string
    xPos: number  // Relative to shape
    yPos: number  // Relative to shape
  }
  
  edges: Edge[] {
    id: string
    point1Id: string  // References point.id
    point2Id: string  // References point.id
    
    edgeModifications: EdgeModification[] {
      id: string
      type: EdgeModificationType
      position: EdgeShapePosition
      distance: number  // inches
      depth: number     // inches
      width: number     // inches
      sideAngleLeft: number   // degrees
      sideAngleRight: number  // degrees
      fullRadiusDepth: number // inches
      
      points: Point[] {  // Pre-calculated intermediate points
        id: string
        xPos: number
        yPos: number
      }
    }
  }
  
  corners: Corner[] {  // Optional corner modifications
    id: string
    pointId: string
    type: CornerType
    // ... corner-specific properties
  }
}
```

### Data Flow

```
┌──────────┐
│ Database │ (Prisma/PostgreSQL)
└────┬─────┘
     │ tRPC query
     ▼
┌──────────────┐
│ design.getById│ (Server)
└────┬─────────┘
     │ Returns CanvasShape[]
     ▼
┌──────────────┐
│DrawingCanvas │ (Client)
└────┬─────────┘
     │ Passes to Shape components
     ▼
┌──────────────┐
│    Shape     │ (Renders each shape)
└──────────────┘
```

---

## Rendering Pipeline

### Overview of Rendering Stages

```
1. Data Loading
   ↓
2. Shape Transformation (rotation, translation)
   ↓
3. Edge Calculation (determine modification positions)
   ↓
4. Point Generation (for straight bumps) OR Dynamic Rendering (for curves)
   ↓
5. Canvas Drawing (Konva.js renders to HTML5 canvas)
```

### Detailed Rendering Flow

#### Stage 1: Shape Component Initialization

**File:** `src/components/shape/Shape/Shape.tsx`

```typescript
<Shape 
  shape={canvasShape}
  isSelected={true}
  onClick={...}
  // ... other props
/>
```

**What happens:**
1. `useShapeState` hook initializes local state (drag, hover)
2. `useShapeTransform` hook calculates bounding box and transformed points
3. `useShapeInteractions` hook sets up event handlers

#### Stage 2: Edge Rendering Decision

**File:** `src/components/shape/Edge/Edge.tsx`

```typescript
// Edge component routes to appropriate renderer
if (hasCurveModifications) {
  return <EdgeWithCurves ... />
} else if (hasModifications) {
  return <EdgeStraight ... />
} else {
  return <Line points={...} />
}
```

**Decision logic:**
- **EdgeWithCurves** → If any modification is BumpInCurve, BumpOutCurve, or FullCurve
- **EdgeStraight** → If modifications exist but are all straight (BumpIn, BumpOut)
- **Simple Line** → If no modifications

#### Stage 3a: Curve Rendering (Dynamic)

**File:** `src/components/shape/Edge/EdgeWithCurves.tsx`

```typescript
<Shape
  sceneFunc={(ctx, shape) => {
    ctx.beginPath();
    drawEdgeWithModifications(ctx, point, nextPoint, edgeModifications, false);
    ctx.fillStrokeShape(shape);
  }}
/>
```

**What happens:**
1. Canvas context is passed to `drawEdgeWithModifications`
2. Function calculates control points dynamically
3. Uses `ctx.quadraticCurveTo()` for smooth curves
4. No stored intermediate points needed

**Files involved:**
- `src/components/edgeUtils/rendering/drawEdgePath.ts` - Orchestrates drawing
- `src/components/edgeUtils/rendering/drawCurve.ts` - Draws curve segments
- `src/components/edgeUtils/calculations/curveCalculations.ts` - Calculates control points

#### Stage 3b: Straight Edge Rendering (Pre-calculated)

**File:** `src/components/shape/Edge/EdgeStraight.tsx`

```typescript
<Line points={allPoints} stroke={...} />
```

**What happens:**
1. Reads pre-calculated points from `edgeModification.points`
2. Flattens into array: `[x1, y1, x2, y2, x3, y3, ...]`
3. Konva Line component renders polyline

**Files involved:**
- Points were pre-calculated during modification creation/update
- Stored in database
- Retrieved with shape data

---

## File Organization

### Component Files (Rendering)

```
src/components/shape/
├── shape/
│   ├── Shape.tsx                      ← Main orchestrator (variant selector)
│   ├── ShapeBackground.tsx            ← Fills shape with color/pattern
│   ├── ShapeEdges.tsx                ← Maps and renders all edges
│   ├── ShapePoints.tsx               ← Renders vertex circles (Shape mode)
│   └── shapeVariants/                ← Mode-specific rendering variants
│       ├── ShapeShape.tsx            ← Shape tab (edges + points interactive)
│       ├── EdgesShape.tsx            ← Edges tab (edges interactive only)
│       ├── DimensionsShape.tsx       ← Dimensions tab (simple rendering)
│       └── shared.ts                 ← Shared TypeScript interfaces
├── edge/
│   ├── Edge.tsx                      ← Routes to appropriate edge renderer
│   ├── EdgeWithCurves.tsx            ← Renders curved edges
│   └── EdgeStraight.tsx              ← Renders straight/bump edges
└── hooks/
    ├── useShapeState.ts              ← Local state (drag, hover)
    ├── useShapeTransform.ts          ← Geometric transformations
    └── useShapeInteractions.ts       ← Event handlers
```

### Utility Files (Calculations)

```
src/components/edgeUtils/
├── calculations/
│   ├── bumpCalculations.ts      ← Pure math for bump geometry
│   ├── curveCalculations.ts     ← Control point calculations
│   └── edgeSegments.ts          ← Segment positioning logic
├── rendering/
│   ├── drawBump.ts              ← Canvas drawing for bumps
│   ├── drawCurve.ts             ← Canvas drawing for curves
│   └── drawEdgePath.ts          ← Main drawing orchestrator
└── points/
    ├── generateBumpPoints.ts    ← Generate points for DB (bumps)
    ├── generateCurvePoints.ts   ← Generate points for DB (curves)
    └── generateEdgePoints.ts    ← Main point generation orchestrator
```

### Mutation Files (State Updates)

```
src/hooks/mutations/edges/
├── useCreateEdgeModification.tsx       ← Create new modification
├── useUpdateEdgeModification.tsx       ← Immediate updates
├── useUpdateEdgeModificationDebounced.tsx  ← Debounced updates (inputs)
└── useDeleteEdgeModification.tsx       ← Remove modification
```

---

## Component Hierarchy

### Full Component Tree

```
DrawingCanvas
├── Stage (Konva)
│   └── Layer (Konva)
│       ├── Shape (many) - Main orchestrator
│       │   │
│       │   ├─── IF Shape Tab (DrawingTab.Shape):
│       │   │    ShapeShape
│       │   │    ├── Group (Konva - for rotation/position)
│       │   │    │   ├── ShapeBackground
│       │   │    │   │   └── KonvaShape (custom fill)
│       │   │    │   ├── ShapeEdges
│       │   │    │   │   └── Edge (for each edge)
│       │   │    │   │       ├── EdgeWithCurves (if has curves)
│       │   │    │   │       │   └── KonvaShape (with sceneFunc)
│       │   │    │   │       ├── EdgeStraight (if has bumps)
│       │   │    │   │       │   └── Line (Konva)
│       │   │    │   │       └── Line (if no modifications)
│       │   │    │   └── ShapePoints (vertex circles)
│       │   │    │       └── Circle (for each point)
│       │   │    ├── ShapeEdgeMeasurements
│       │   │    └── Debug Layers (if enabled)
│       │   │
│       │   ├─── IF Edges Tab (DrawingTab.Edges):
│       │   │    EdgesShape
│       │   │    ├── Group (Konva)
│       │   │    │   ├── ShapeBackground
│       │   │    │   └── ShapeEdges (no ShapePoints)
│       │   │    ├── ShapeEdgeMeasurements
│       │   │    └── Debug Layers (if enabled)
│       │   │
│       │   └─── IF Dimensions Tab (DrawingTab.Dimensions) or Default:
│       │        DimensionsShape
│       │        ├── KonvaShape (single element, sceneFunc)
│       │        ├── ShapeEdgeMeasurements
│       │        └── Debug Layers (if enabled)
│       │
│       └── Text (many)
├── SidePanel (UI controls)
└── DebugSidePanel (development tools)
```

---

## Shape Rendering Variants

The system renders shapes differently based on the active tab (DrawingTab). This allows for optimized rendering and appropriate interactivity for each editing mode.

### Three Shape Variants

#### 1. ShapeShape (Shape Tab)

**File:** `src/components/shape/shape/shapeVariants/ShapeShape.tsx`

**Active When:** `activeTab === DrawingTab.Shape` (Tab 2)

**Features:**
- ✅ Interactive edges (clickable, hoverable)
- ✅ Interactive points/vertices (clickable, hoverable)
- ✅ Edge measurements displayed
- ✅ Debug layers available
- Uses `Group` + separate `ShapeBackground` + `ShapeEdges` + `ShapePoints`

**Use Case:** Full shape editing - users can modify both the shape outline (points) and edge modifications (bumps, curves).

**Visual Structure:**
```
Group (rotated/positioned)
├── ShapeBackground (fill)
├── ShapeEdges (each edge separately rendered)
│   └── Edge components (with modifications)
└── ShapePoints (vertex circles)
```

**Props Required:**
- All base props
- Edge interaction props (hoveredEdgeIndex, handleEdgeClick, etc.)
- Point interaction props (hoveredPointIndex, handlePointClick, etc.)

---

#### 2. EdgesShape (Edges Tab)

**File:** `src/components/shape/shape/shapeVariants/EdgesShape.tsx`

**Active When:** `activeTab === DrawingTab.Edges` (Tab 3)

**Features:**
- ✅ Interactive edges (clickable, hoverable)
- ❌ No interactive points (points are not rendered)
- ✅ Edge measurements displayed
- ✅ Debug layers available
- Uses `Group` + separate `ShapeBackground` + `ShapeEdges`

**Use Case:** Edge modification editing - users focus on adding/modifying bumps, curves, and clips without point distractions.

**Visual Structure:**
```
Group (rotated/positioned)
├── ShapeBackground (fill)
└── ShapeEdges (each edge separately rendered)
    └── Edge components (with modifications)
```

**Props Required:**
- All base props
- Edge interaction props (hoveredEdgeIndex, handleEdgeClick, etc.)

---

#### 3. DimensionsShape (Dimensions Tab)

**File:** `src/components/shape/shape/shapeVariants/DimensionsShape.tsx`

**Active When:** `activeTab === DrawingTab.Dimensions` (Tab 1) or any other tab

**Features:**
- ❌ No interactive edges (whole shape is one element)
- ❌ No interactive points
- ✅ Edge measurements displayed
- ✅ Debug layers available (edge indices only)
- Uses single `KonvaShape` with `sceneFunc` for efficient rendering

**Use Case:** Dimension viewing and overall shape manipulation - users see the final shape without editing individual components.

**Visual Structure:**
```
KonvaShape (single element)
└── sceneFunc draws complete path with all modifications
```

**Props Required:**
- All base props only (no edge/point interaction props)

**Performance Benefit:** Most efficient rendering - single shape with custom drawing function, no individual edge elements.

---

### Variant Selection Logic

**File:** `src/components/shape/shape/Shape.tsx`

```typescript
// Main Shape component decides which variant to render
if (activeTab === DrawingTab.Shape) {
  return <ShapeShape ... />  // Full interactivity
}

if (activeTab === DrawingTab.Edges) {
  return <EdgesShape ... />  // Edges only
}

// Default: Dimensions tab (or any other tab)
return <DimensionsShape ... />  // Simple rendering
```

### Shared Props Interface

**File:** `src/components/shape/shape/shapeVariants/shared.ts`

All variants share a common base interface for consistency:

```typescript
BaseShapeVariantProps {
  shape, centerX, centerY, dragOffset, absolutePoints,
  isSelected, isHovered, isDrawing, isDraggable,
  onClick, onMouseEnter, onMouseLeave, onContextMenu,
  onDragStart, onDragMove, onDragEnd,
  isDebugMode, scale
}

EdgeInteractionProps {
  hoveredEdgeIndex, selectedEdgeIndex,
  handleEdgeClick, handleEdgeMouseEnter, handleEdgeMouseLeave
}

PointInteractionProps {
  hoveredPointIndex, selectedPointIndex,
  handlePointClick, handlePointMouseEnter, handlePointMouseLeave
}
```

**Type Composition:**
- ShapeShape: `BaseShapeVariantProps` + `EdgeInteractionProps` + `PointInteractionProps`
- EdgesShape: `BaseShapeVariantProps` + `EdgeInteractionProps`
- DimensionsShape: `BaseShapeVariantProps` only

### Why This Design?

**Separation of Concerns:**
- Each variant handles exactly what's needed for its editing mode
- No unnecessary event listeners or DOM elements
- Clear responsibilities per component

**Performance:**
- Dimensions tab renders most efficiently (single shape)
- Edge/Point interaction only enabled when needed
- Reduced re-renders by isolating variant-specific state

**Maintainability:**
- Easy to modify behavior for specific tabs
- Shared base props ensure consistency
- TypeScript enforces correct prop usage per variant

**UX:**
- Users see only relevant interactive elements per mode
- No visual clutter from unused features
- Clear mental model: each tab has appropriate controls

---

## Calculation Flow

### Creating an Edge Modification

```
User Changes Input Field (e.g., depth = 2 inches)
         ↓
Component: EditCurvesAndBumps.tsx
         ↓
Hook: useUpdateEdgeModificationDebounced.tsx
         ↓
1. performOptimisticUpdate() - Immediate UI update
   └─ Recalculates points with generateEdgePoints()
         ↓
2. debouncedMutation() - After 500ms delay
   └─ Calls generateEdgePoints()
   └─ Sends to server: api.design.updateShapeEdge.mutate()
         ↓
Server: src/server/api/routers/design.ts
         ↓
1. Updates EdgeModification in database
2. Deletes old points
3. Creates new points from generateEdgePoints()
         ↓
Response sent back to client
         ↓
Cache updated (tRPC)
         ↓
Shape re-renders with new data
```

### Point Generation for Bumps (Straight)

**Entry Point:** `src/components/edgeUtils/points/generateEdgePoints.ts`

```typescript
generateEdgePoints(point, nextPoint, modifications, pointsPerUnit)
  ↓
calculateEdgeVectors(point, nextPoint)
  → Returns: edgeUnitX, edgeUnitY, perpX, perpY, edgeLength
  ↓
calculateModificationSegments(modifications, edgeLength)
  → Determines where each modification sits on the edge
  → Returns: ModificationSegment[] sorted by position
  ↓
For each segment:
  ├─ If gap before segment: add straight line point
  └─ generateModificationPoints()
      ├─ BumpIn/BumpOut → generateBumpStraightPoints()
      │   └─ calculateBumpPoints()
      │       → Returns 6 coordinates: [x1,y1, x2,y2, x3,y3]
      ├─ BumpInCurve/BumpOutCurve → generateBumpCurvePoints()
      │   → Returns 2 points: start and end of curve
      └─ FullCurve → generateFullCurvePoints()
          → Returns 2 points: start and end of edge
  ↓
Returns: Coordinate[] (all intermediate points)
  → Stored in database
  → Used by EdgeStraight component for rendering
```

### Curve Rendering (Dynamic Calculation)

**Entry Point:** `src/components/edgeUtils/rendering/drawEdgePath.ts`

```typescript
drawEdgeWithModifications(ctx, point, nextPoint, modifications, skipMoveTo)
  ↓
calculateEdgeVectors(point, nextPoint)
  ↓
calculateModificationSegments(modifications, edgeLength)
  ↓
ctx.moveTo(point.xPos, point.yPos)
  ↓
For each segment:
  ├─ Draw straight line to segment start (if needed)
  └─ drawModification()
      ├─ BumpInCurve/BumpOutCurve → drawBumpCurve()
      │   ├─ calculateBumpCurveControlPoint()
      │   │   → Calculates control point from depth/width
      │   └─ ctx.quadraticCurveTo(controlX, controlY, endX, endY)
      └─ FullCurve → drawFullCurve()
          ├─ calculateFullCurveControlPoint()
          │   → Calculates control point from fullRadiusDepth
          └─ ctx.quadraticCurveTo(controlX, controlY, endX, endY)
  ↓
Draw final straight line to edge end (if needed)
  ↓
Canvas renders smooth curve using native browser curve rendering
```

---

## Modification Types

### 1. Bump In (Straight)

**Visual:**
```
        ╱╲
       ╱  ╲
━━━━━━     ━━━━━━
   Edge with bump into shape
```

**Parameters:**
- `depth`: How far it extends inward
- `width`: How wide along the edge
- `sideAngleLeft`: Angle of left side
- `sideAngleRight`: Angle of right side

**Point Generation:**
```typescript
calculateBumpPoints(mod, startPoint, startOffset, endOffset, ...)
  → Returns 6 points: [bottomLeft, bottomRight, end]
  → Stored in database
```

**Rendering:**
```typescript
EdgeStraight: <Line points={[start, p1, p2, p3, p4, p5, p6, end]} />
```

### 2. Bump Out (Straight)

**Visual:**
```
━━━━━━     ━━━━━━
       ╲  ╱
        ╲╱
   Edge with bump out of shape
```

**Same as Bump In but `direction = -1` (outward instead of inward)**

### 3. Bump In Curve

**Visual:**
```
        ╱‾‾╲
       ╱    ╲
━━━━━━      ━━━━━━
   Edge with smooth curve into shape
```

**Parameters:**
- `depth`: How far the curve extends inward
- `width`: How wide along the edge

**Point Storage (Optimized):**
```typescript
generateBumpCurvePoints()
  → Returns 2 points only: [start, end]
  → Control point NOT stored (calculated at render time)
```

**Rendering (Dynamic):**
```typescript
drawBumpCurve()
  → calculateBumpCurveControlPoint()
    → controlX = midX + direction * perpX * depth
    → controlY = midY + direction * perpY * depth
  → ctx.quadraticCurveTo(controlX, controlY, endX, endY)
```

**Why This Approach:**
- Native curve rendering is smoother than polylines
- Fewer points in database (~90% reduction)
- Easy to modify parameters (just change depth/width)
- Control point calculated from depth, so it's always mathematically correct

### 4. Bump Out Curve

**Visual:**
```
━━━━━━      ━━━━━━
       ╲    ╱
        ╲__╱
   Edge with smooth curve out of shape
```

**Same as Bump In Curve but `direction = -1`**

### 5. Full Curve

**Visual:**
```
     ╱‾‾‾‾‾‾╲
    ╱        ╲
   ●          ●
 Start       End
   
   Entire edge becomes a smooth curve
```

**Parameters:**
- `fullRadiusDepth`: How far the curve extends (positive = outward, negative = inward)

**Point Storage:**
```typescript
generateFullCurvePoints()
  → Returns 2 points: [edgeStart, edgeEnd]
  → Control point calculated from fullRadiusDepth
```

**Rendering:**
```typescript
drawFullCurve()
  → Control point = edge midpoint + perpendicular * fullRadiusDepth
  → ctx.quadraticCurveTo(controlX, controlY, endX, endY)
```

---

## Complete Flow Examples

### Example 1: User Creates a Bump Out

#### Step 1: User Interaction
```
User clicks edge → Edge selected
User clicks "Bump Out" button → Type selected
User enters depth = 1 inch, width = 3 inches
```

#### Step 2: Optimistic Update (Immediate)
**File:** `useUpdateEdgeModificationDebounced.tsx`
```typescript
performOptimisticUpdate({
  depth: 1,
  width: 3,
  type: EdgeModificationType.BumpOut
})
  ↓
// Recalculate points immediately for UI
const point1 = shape.points.find(...)
const point2 = shape.points.find(...)
const calculatedCoords = generateEdgePoints(point1, point2, [updatedMod])
  ↓
// Update cache with new points
utils.design.getById.setData({ id }, {
  shapes: [...shapes with updated points...]
})
  ↓
// Shape re-renders with new visualization
```

#### Step 3: Point Generation
**File:** `generateEdgePoints.ts`
```typescript
generateEdgePoints(point1, point2, [bumpOutModification])
  ↓
calculateEdgeVectors()
  → edgeLength = 100px
  → edgeUnitX = 1, edgeUnitY = 0
  → perpX = 0, perpY = -1 (pointing down for horizontal edge)
  ↓
calculateModificationSegments()
  → segment.startOffset = 35.5 (centered, accounting for width)
  → segment.endOffset = 35.5 + 72 = 107.5 (width * DPI)
  ↓
generateBumpStraightPoints(bumpOut, inward=false)
  ↓
calculateBumpPoints()
  direction = -1 (outward)
  depthPixels = 1 * 72 = 72px
  widthPixels = 3 * 72 = 216px
  
  startX = 100 + 1 * 35.5 = 135.5
  startY = 100 + 0 * 35.5 = 100
  
  bottomLeftX = 135.5 + (-1) * 0 * 72 = 135.5
  bottomLeftY = 100 + (-1) * -1 * 72 = 172
  
  bottomRightX = 135.5 + 1 * 216 = 351.5
  bottomRightY = 172
  
  endX = 351.5 + ... (accounting for angles)
  endY = 100
  
  → Returns: [135.5, 172, 351.5, 172, 351.5, 100]
```

#### Step 4: Database Update (After 500ms debounce)
**File:** `design.ts` (server)
```typescript
api.design.updateShapeEdge.mutate({
  edgeModificationId: "mod-123",
  edgeModification: {
    type: EdgeModificationType.BumpOut,
    depth: 1,
    width: 3,
    points: [
      { xPos: 135.5, yPos: 172 },
      { xPos: 351.5, yPos: 172 },
      { xPos: 351.5, yPos: 100 }
    ]
  }
})
  ↓
// Server deletes old points
await ctx.db.point.deleteMany({ where: { edgeModificationsPoints: { some: { id: "mod-123" } } } })
  ↓
// Server creates new points
await ctx.db.edgeModification.update({
  where: { id: "mod-123" },
  data: {
    depth: 1,
    width: 3,
    points: {
      create: [
        { xPos: 135.5, yPos: 172 },
        { xPos: 351.5, yPos: 172 },
        { xPos: 351.5, yPos: 100 }
      ]
    }
  }
})
```

#### Step 5: Rendering
**File:** `EdgeStraight.tsx`
```typescript
const allPoints = [
  100, 100,           // Edge start (shape point)
  135.5, 172,         // Bump point 1
  351.5, 172,         // Bump point 2
  351.5, 100,         // Bump point 3
  400, 100            // Edge end (shape point)
]

<Line points={allPoints} stroke="black" strokeWidth={2} />
```

**Result:** Konva renders a polyline with the bump protruding downward.

---

### Example 2: User Creates a Bump Out Curve

#### Key Differences from Straight Bump:

**Point Generation:**
```typescript
generateBumpCurvePoints()
  → Returns ONLY 2 points: [start, end]
  → NOT 6 points like straight bump
  → Control point NOT stored
```

**Database:**
```sql
edgeModification {
  id: "mod-456",
  type: "BumpOutCurve",
  depth: 1,
  width: 3,
  points: [
    { xPos: 135.5, yPos: 100 },  -- Start of curve
    { xPos: 351.5, yPos: 100 }   -- End of curve
  ]
}
```

**Rendering:**
```typescript
// EdgeWithCurves.tsx routes to:
<Shape sceneFunc={(ctx, shape) => {
  ctx.beginPath();
  drawEdgeWithModifications(ctx, point, nextPoint, [bumpOutCurve], false);
  ctx.fillStrokeShape(shape);
}} />

// Which calls:
drawBumpCurve(ctx, bumpOutCurve, ...)
  ↓
calculateBumpCurveControlPoint()
  startX = 135.5, startY = 100
  endX = 351.5, endY = 100
  midX = (135.5 + 351.5) / 2 = 243.5
  midY = 100
  direction = -1 (outward)
  controlX = 243.5 + (-1) * 0 * 72 = 243.5
  controlY = 100 + (-1) * (-1) * 72 = 172
  ↓
ctx.quadraticCurveTo(243.5, 172, 351.5, 100)
```

**Result:** Browser renders a smooth quadratic Bezier curve from (135.5, 100) through control point (243.5, 172) to (351.5, 100).

**Visual Comparison:**
```
Straight Bump (6 points stored):
━━━━╲    ╱━━━━
     ╲__╱

Curved Bump (2 points stored):
━━━━╲  ╱━━━━
     ╲╱
```

---

## Key Design Decisions

### 1. Why Pre-calculate Points for Straight Bumps?
**Decision:** Store all intermediate points in database.

**Rationale:**
- Straight lines can't be calculated from just 2 points and depth
- Need exact corner coordinates for angled sides
- Performance: No calculation needed during render
- Simplicity: Just flatten points array and pass to Konva Line

### 2. Why Calculate Curves Dynamically?
**Decision:** Store only start/end points, calculate control point at render time.

**Rationale:**
- Quadratic curves perfectly defined by start, end, and control point
- Control point is mathematical function of depth: `controlPoint = midpoint + perpendicular * depth`
- Native browser curve rendering is smoother than polylines
- 90% reduction in stored points
- Easy to modify: Just change depth parameter, control point recalculates automatically

### 3. Why Separate Edge and EdgeWithCurves Components?
**Decision:** Route to different components based on modification type.

**Rationale:**
- Different rendering APIs: `Line` vs `Shape` with `sceneFunc`
- Optimization: Line component is faster for simple polylines
- Clarity: Each component has single responsibility
- Performance: Memoization works better with focused components

### 4. Why Use Konva Shape sceneFunc for Curves?
**Decision:** Use custom canvas drawing function instead of generating many Line segments.

**Rationale:**
- Native `quadraticCurveTo` is hardware-accelerated
- Smoother curves than approximation with line segments
- Consistent with clipping path (both use same function)
- Standard Konva pattern for custom drawings

---

## Performance Considerations

### Rendering Optimization

**Problem:** Re-rendering all shapes on every state change is expensive.

**Solutions:**
1. **Component Memoization:** All components wrapped in `React.memo`
2. **Hook Memoization:** Expensive calculations in `useMemo`
3. **Callback Stability:** Event handlers in `useCallback`
4. **Render Isolation:** Sub-components only re-render when their props change

**Example:**
```typescript
// ShapeEdges only re-renders if hoveredEdgeIndex or selectedEdgeIndex changes
const ShapeEdges = memo(({ hoveredEdgeIndex, selectedEdgeIndex, ... }) => {
  // Render edges
})
```

### Calculation Optimization

**Problem:** Generating points for every edge modification on every change.

**Solutions:**
1. **Debouncing:** Input changes debounced by 500ms
2. **Optimistic Updates:** Cache updated immediately, server called later
3. **Pre-calculation:** Points calculated once and stored, not on every render
4. **Dynamic Curves:** Control points calculated from simple formula, not stored

### Database Optimization

**Problem:** Storing thousands of points for complex shapes.

**Solutions:**
1. **Curve Optimization:** Only 2 points per curve instead of 20-50
2. **Cascading Deletes:** Old points automatically deleted when modification updated
3. **Batch Operations:** All modifications in single transaction

---

## Debugging

### Debug Mode

**Activation:** Toggle in DebugSidePanel

**Visualizations:**
1. **Edge Indices** (Red lines): Shows start/end edges of shape
2. **Point Overlay** (Blue/Magenta circles):
   - Blue: Shape vertices
   - Magenta: Modification points
   - Labels: ID, coordinates

**Files:**
- `src/components/shape/debug/ShapeDebugLayer.tsx` - Edge indices
- `src/components/shape/debug/PointsDebugLayer.tsx` - All points
- `src/components/shape/debug/DebugPoint.tsx` - Reusable point component

---