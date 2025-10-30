/**
 * Edge Utilities - Main Barrel Export
 * 
 * Organized edge utility functions for calculations, rendering, and point generation.
 * This modular structure improves maintainability and enables tree-shaking.
 */

// Calculations
export { calculateBumpPoints } from "./calculations/bumpCalculations";
export {
	calculateBumpCurveControlPoint,
	calculateFullCurveControlPoint,
} from "./calculations/curveCalculations";
export {
	calculateEdgeVectors,
	calculateModificationSegments,
	type ModificationSegment,
} from "./calculations/edgeSegments";

// Rendering
export { drawBumpStraight, drawBumpCurve } from "./rendering/drawBump";
export { drawFullCurve } from "./rendering/drawCurve";
export {
	drawEdgeWithModifications,
	drawCompleteShapePath,
} from "./rendering/drawEdgePath";

// Point Generation (for database storage)
export {
	generateBumpStraightPoints,
	generateBumpCurvePoints,
} from "./points/generateBumpPoints";
export { generateFullCurvePoints } from "./points/generateCurvePoints";
export { generateEdgePoints } from "./points/generateEdgePoints";

