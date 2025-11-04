import type { Point, EdgeModificationForCalculation } from "~/types/drawing";
import type { Context } from "konva/lib/Context";
import { calculateBumpPoints } from "../calculations/bumpCalculations";
import { calculateBumpCurveControlPoint } from "../calculations/curveCalculations";

/**
 * Draw straight bump (BumpIn or BumpOut) using straight lines
 * Uses precalculated points if available, otherwise calculates on the fly
 * @param inward - true for bump-in, false for bump-out
 */
export const drawBumpStraight = (
	ctx: Context,
	mod: EdgeModificationForCalculation,
	startPoint: Point,
	startOffset: number,
	endOffset: number,
	edgeUnitX: number,
	edgeUnitY: number,
	perpX: number,
	perpY: number,
	inward: boolean,
): void => {
	// Check if modification has precalculated points (from database)
	// Type assertion needed because EdgeModificationForCalculation doesn't include points
	const modWithPoints = mod as EdgeModificationForCalculation & { points?: Point[] };
	
	if (modWithPoints.points && modWithPoints.points.length > 0) {
		// Use precalculated points for consistency with shape mode
		for (const point of modWithPoints.points) {
			ctx.lineTo(point.xPos, point.yPos);
		}
		return;
	}

	// Fallback: Calculate points on the fly (for backward compatibility)
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

	// Draw straight lines for bump
	for (let i = 0; i < points.length; i += 2) {
		const x = points[i];
		const y = points[i + 1];
		if (x !== undefined && y !== undefined) {
			ctx.lineTo(x, y);
		}
	}
};

/**
 * Draw bump curve using native canvas quadratic curve
 * @param inward - true for bump-in curve, false for bump-out curve
 */
export const drawBumpCurve = (
	ctx: Context,
	mod: EdgeModificationForCalculation,
	startPoint: Point,
	startOffset: number,
	endOffset: number,
	edgeUnitX: number,
	edgeUnitY: number,
	perpX: number,
	perpY: number,
	inward: boolean,
): void => {
	const { controlX, controlY, endX, endY } = calculateBumpCurveControlPoint(
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

	// Draw single smooth quadratic curve
	ctx.quadraticCurveTo(controlX, controlY, endX, endY);
};

