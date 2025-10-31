import type { Point, EdgeModificationForCalculation } from "~/types/drawing";
import { DPI } from "~/utils/canvas-constants";

/**
 * Calculate bump points for both bump-in and bump-out modifications
 * @param inward - true for bump-in (into shape), false for bump-out (out of shape)
 * @returns Array of coordinates [bottomLeftX, bottomLeftY, bottomRightX, bottomRightY, endX, endY]
 */
export const calculateBumpPoints = (
	mod: EdgeModificationForCalculation,
	startPoint: Point,
	startOffset: number,
	endOffset: number,
	edgeUnitX: number,
	edgeUnitY: number,
	perpX: number,
	perpY: number,
	inward: boolean,
): number[] => {
	const depthPixels = mod.depth * DPI;
	const widthPixels = mod.width * DPI;
	const angleLeftRad = (mod.sideAngleLeft * Math.PI) / 180;
	const angleRightRad = (mod.sideAngleRight * Math.PI) / 180;

	// Direction multiplier: +1 for inward (bump-in), -1 for outward (bump-out)
	const direction = inward ? 1 : -1;

	// Start point of the bump on the edge
	const startX = startPoint.xPos + edgeUnitX * startOffset;
	const startY = startPoint.yPos + edgeUnitY * startOffset;

	// Left side: Go perpendicular at an angle
	// We go perpendicular by depth, with the angle causing a shift along the edge
	const leftShiftAlong = Math.tan(angleLeftRad) * depthPixels;
	const bottomLeftX =
		startX + direction * perpX * depthPixels + edgeUnitX * leftShiftAlong;
	const bottomLeftY =
		startY + direction * perpY * depthPixels + edgeUnitY * leftShiftAlong;

	// Move across by width along the edge direction
	const bottomRightX = bottomLeftX + edgeUnitX * widthPixels;
	const bottomRightY = bottomLeftY + edgeUnitY * widthPixels;

	// Right side: Come back at an angle
	// The right angle shifts along the edge
	const rightShiftAlong = Math.tan(angleRightRad) * depthPixels;
	const endX =
		bottomRightX - direction * perpX * depthPixels + edgeUnitX * rightShiftAlong;
	const endY =
		bottomRightY - direction * perpY * depthPixels + edgeUnitY * rightShiftAlong;

	return [bottomLeftX, bottomLeftY, bottomRightX, bottomRightY, endX, endY];
};

