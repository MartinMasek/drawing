import type { Point, EdgeModificationForCalculation } from "~/types/drawing";
import type { Context } from "konva/lib/Context";
import { calculateBumpPoints } from "../calculations/bumpCalculations";
import { calculateBumpCurveControlPoint } from "../calculations/curveCalculations";

/**
 * Draw straight bump (BumpIn or BumpOut) using straight lines
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

