import type { Point, EdgeModificationForCalculation, Coordinate } from "~/types/drawing";

/**
 * Generate points for full curves for database storage
 * For full curves, store the start and end points (entire edge)
 * The control point (fullRadiusDepth) is calculated dynamically at render time
 */
export const generateFullCurvePoints = (
	mod: EdgeModificationForCalculation,
	startPoint: Point,
	startOffset: number,
	endOffset: number,
	edgeUnitX: number,
	edgeUnitY: number,
): Coordinate[] => {
	// For full curves, store the start and end points (entire edge)
	// The control point (fullRadiusDepth) is calculated dynamically at render time
	const startX = startPoint.xPos + edgeUnitX * startOffset;
	const startY = startPoint.yPos + edgeUnitY * startOffset;

	const endX = startPoint.xPos + edgeUnitX * endOffset;
	const endY = startPoint.yPos + edgeUnitY * endOffset;

	return [
		{ xPos: startX, yPos: startY }, // Start point (beginning of edge)
		{ xPos: endX, yPos: endY }, // End point (end of edge)
	];
};

