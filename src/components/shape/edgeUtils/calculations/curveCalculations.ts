import type { Point, EdgeModificationForCalculation } from "~/types/drawing";
import { DPI } from "~/utils/canvas-constants";

/**
 * Calculate control point for bump curve (quadratic Bezier)
 * @param inward - true for bump-in curve, false for bump-out curve
 * @returns Object with control point coordinates
 */
export const calculateBumpCurveControlPoint = (
	mod: EdgeModificationForCalculation,
	startPoint: Point,
	startOffset: number,
	endOffset: number,
	edgeUnitX: number,
	edgeUnitY: number,
	perpX: number,
	perpY: number,
	inward: boolean,
): { controlX: number; controlY: number; startX: number; startY: number; endX: number; endY: number } => {
	const depthPixels = mod.depth * DPI;
	const widthPixels = mod.width * DPI;

	// Direction multiplier: +1 for inward, -1 for outward
	const direction = inward ? 1 : -1;

	// Start point on the edge
	const startX = startPoint.xPos + edgeUnitX * startOffset;
	const startY = startPoint.yPos + edgeUnitY * startOffset;

	// End point on the edge
	const endX = startPoint.xPos + edgeUnitX * endOffset;
	const endY = startPoint.yPos + edgeUnitY * endOffset;

	// Control point at the middle (deepest point of the curve)
	const midX = startX + edgeUnitX * (widthPixels / 2);
	const midY = startY + edgeUnitY * (widthPixels / 2);
	const controlX = midX + direction * perpX * depthPixels;
	const controlY = midY + direction * perpY * depthPixels;

	return { controlX, controlY, startX, startY, endX, endY };
};

/**
 * Calculate control point for full curve (spans entire edge)
 * @returns Object with control point coordinates
 */
export const calculateFullCurveControlPoint = (
	mod: EdgeModificationForCalculation,
	startPoint: Point,
	startOffset: number,
	endOffset: number,
	edgeUnitX: number,
	edgeUnitY: number,
	perpX: number,
	perpY: number,
): { controlX: number; controlY: number; endX: number; endY: number } => {
	// Negative depth for outward curve (invert the perpendicular direction)
	const depthPixels = -mod.fullRadiusDepth * DPI;

	// End point on the edge
	const endX = startPoint.xPos + edgeUnitX * endOffset;
	const endY = startPoint.yPos + edgeUnitY * endOffset;

	// Control point at midpoint, perpendicular by depth
	const midOffset = (startOffset + endOffset) / 2;
	const midEdgeX = startPoint.xPos + edgeUnitX * midOffset;
	const midEdgeY = startPoint.yPos + edgeUnitY * midOffset;

	// Control point - positive depth = curve outward, negative = curve inward
	const controlX = midEdgeX + perpX * depthPixels;
	const controlY = midEdgeY + perpY * depthPixels;

	return { controlX, controlY, endX, endY };
};

