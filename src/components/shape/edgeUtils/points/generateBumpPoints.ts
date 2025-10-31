import type { Point, EdgeModificationForCalculation, Coordinate } from "~/types/drawing";
import { calculateBumpPoints } from "../calculations/bumpCalculations";

/**
 * Generate points for straight bumps (BumpIn, BumpOut) for database storage
 * Returns corner points of the bump
 * @param inward - true for bump-in, false for bump-out
 */
export const generateBumpStraightPoints = (
	mod: EdgeModificationForCalculation,
	startPoint: Point,
	startOffset: number,
	endOffset: number,
	edgeUnitX: number,
	edgeUnitY: number,
	perpX: number,
	perpY: number,
	inward: boolean,
): Coordinate[] => {
	const points = calculateBumpPoints(
		mod,
		startPoint,
		startOffset,
		endOffset,
		edgeUnitX,
		edgeUnitY,
		perpX,
		perpY,
		inward,
	);

	const coords: Coordinate[] = [];
	for (let i = 0; i < points.length; i += 2) {
		const x = points[i];
		const y = points[i + 1];
		if (x !== undefined && y !== undefined) {
			coords.push({ xPos: x, yPos: y });
		}
	}
	return coords;
};

/**
 * Generate points for bump curves (BumpInCurve, BumpOutCurve) for database storage
 * For curves, store only the start and end points (the corners of the modification)
 * The control point (depth) is calculated dynamically at render time
 */
export const generateBumpCurvePoints = (
	mod: EdgeModificationForCalculation,
	startPoint: Point,
	startOffset: number,
	endOffset: number,
	edgeUnitX: number,
	edgeUnitY: number,
): Coordinate[] => {
	// For curves, store only the start and end points (the corners of the modification)
	// The control point (depth) is calculated dynamically at render time
	const startX = startPoint.xPos + edgeUnitX * startOffset;
	const startY = startPoint.yPos + edgeUnitY * startOffset;

	const endX = startPoint.xPos + edgeUnitX * endOffset;
	const endY = startPoint.yPos + edgeUnitY * endOffset;

	return [
		{ xPos: startX, yPos: startY }, // Start point (where modification begins)
		{ xPos: endX, yPos: endY }, // End point (where modification ends)
	];
};

