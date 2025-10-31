/**
 * Shape Components - Main Barrel Export
 * 
 * Organized shape components for rendering and interacting with canvas shapes.
 * This modular structure improves maintainability and reusability.
 */

// Main Shape component
export { default as Shape } from "./shape/Shape";

// Sub-components
export { default as ShapeBackground } from "./shape/ShapeBackground";
export { default as ShapeEdges } from "./shape/ShapeEdges";
export { default as ShapePoints } from "./shape/ShapePoints";

// Edge components
export { default as Edge } from "./edge/Edge";
export { default as EdgeWithCurves } from "./edge/EdgeWithCurves";
export { default as EdgeStraight } from "./edge/EdgeStraight";

// Debug components
export { default as ShapeDebugLayer } from "./debug/ShapeDebugLayer";
export { default as PointsDebugLayer } from "./debug/PointsDebugLayer";
export { default as DebugPoint } from "./debug/DebugPoint";

// Hooks
export { useShapeState } from "./hooks/useShapeState";
export { useShapeTransform } from "./hooks/useShapeTransform";
export { useShapeInteractions } from "./hooks/useShapeInteractions";

