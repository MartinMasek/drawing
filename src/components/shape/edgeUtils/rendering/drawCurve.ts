import type { Point, EdgeModificationForCalculation } from "~/types/drawing";
import type { Context } from "konva/lib/Context";
import { calculateFullCurveControlPoint } from "../calculations/curveCalculations";

/**
 * Draw full curve using native canvas quadratic curve
 * Full curve spans the entire edge from start to end
 */
export const drawFullCurve = (
	ctx: Context,
	mod: EdgeModificationForCalculation,
	startPoint: Point,
	startOffset: number,
	endOffset: number,
	edgeUnitX: number,
	edgeUnitY: number,
	perpX: number,
	perpY: number,
): void => {
	const { controlX, controlY, endX, endY } = calculateFullCurveControlPoint(
		mod,
		startPoint,
		startOffset,
		endOffset,
		edgeUnitX,
		edgeUnitY,
		perpX,
		perpY,
	);

	// Draw smooth quadratic curve using native canvas method
	ctx.quadraticCurveTo(controlX, controlY, endX, endY);
};

