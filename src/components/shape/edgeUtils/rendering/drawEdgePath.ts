import type {
	Point,
	EdgeModificationForCalculation,
	CanvasShape,
} from "~/types/drawing";
import type { Context } from "konva/lib/Context";
import { EdgeModificationType } from "@prisma/client";
import {
	calculateEdgeVectors,
	calculateModificationSegments,
} from "../calculations/edgeSegments";
import { drawBumpStraight, drawBumpCurve } from "./drawBump";
import { drawFullCurve } from "./drawCurve";

/**
 * Draw a single modification segment
 */
const drawModification = (
	ctx: Context,
	modification: EdgeModificationForCalculation,
	startPoint: Point,
	startOffset: number,
	endOffset: number,
	edgeUnitX: number,
	edgeUnitY: number,
	perpX: number,
	perpY: number,
): void => {
	switch (modification.type) {
		case EdgeModificationType.BumpIn:
			drawBumpStraight(
				ctx,
				modification,
				startPoint,
				startOffset,
				endOffset,
				edgeUnitX,
				edgeUnitY,
				perpX,
				perpY,
				true, // inward
			);
			break;
		case EdgeModificationType.BumpOut:
			drawBumpStraight(
				ctx,
				modification,
				startPoint,
				startOffset,
				endOffset,
				edgeUnitX,
				edgeUnitY,
				perpX,
				perpY,
				false, // outward
			);
			break;
		case EdgeModificationType.BumpInCurve:
			drawBumpCurve(
				ctx,
				modification,
				startPoint,
				startOffset,
				endOffset,
				edgeUnitX,
				edgeUnitY,
				perpX,
				perpY,
				true, // inward
			);
			break;
		case EdgeModificationType.BumpOutCurve:
			drawBumpCurve(
				ctx,
				modification,
				startPoint,
				startOffset,
				endOffset,
				edgeUnitX,
				edgeUnitY,
				perpX,
				perpY,
				false, // outward
			);
			break;
		case EdgeModificationType.FullCurve:
			drawFullCurve(
				ctx,
				modification,
				startPoint,
				startOffset,
				endOffset,
				edgeUnitX,
				edgeUnitY,
				perpX,
				perpY,
			);
			break;
		case EdgeModificationType.None:
			// Draw straight line to end
			ctx.lineTo(
				startPoint.xPos + edgeUnitX * endOffset,
				startPoint.yPos + edgeUnitY * endOffset,
			);
			break;
	}
};

/**
 * Draw edge path with modifications to canvas context
 * Main exported function for rendering edges with any modifications
 * @param skipMoveTo - If true, doesn't call moveTo (for continuing an existing path)
 */
export const drawEdgeWithModifications = (
	ctx: Context,
	point: Point,
	nextPoint: Point,
	modifications: EdgeModificationForCalculation[],
	skipMoveTo = false,
): void => {
	const { edgeUnitX, edgeUnitY, perpX, perpY, edgeLength } =
		calculateEdgeVectors(point, nextPoint);

	const segments = calculateModificationSegments(modifications, edgeLength);

	// Start the path (unless continuing an existing path)
	if (!skipMoveTo) {
		ctx.moveTo(point.xPos, point.yPos);
	}
	let currentOffset = 0;

	for (const segment of segments) {
		// Draw straight line to start of modification if needed
		if (currentOffset < segment.startOffset) {
			ctx.lineTo(
				point.xPos + edgeUnitX * segment.startOffset,
				point.yPos + edgeUnitY * segment.startOffset,
			);
		}

		// Draw the modification
		drawModification(
			ctx,
			segment.modification,
			point,
			segment.startOffset,
			segment.endOffset,
			edgeUnitX,
			edgeUnitY,
			perpX,
			perpY,
		);

		currentOffset = segment.endOffset;
	}

	// Draw final segment if needed
	if (currentOffset < edgeLength) {
		ctx.lineTo(nextPoint.xPos, nextPoint.yPos);
	}
};

/**
 * Draw complete shape path including all edge modifications to canvas context
 * Iterates through all edges of a shape and draws them with their modifications
 * @param ctx - Canvas context
 * @param shape - Shape to draw
 */
export const drawCompleteShapePath = (
	ctx: Context,
	shape: CanvasShape,
): void => {
	for (let i = 0; i < shape.points.length; i++) {
		const point = shape.points[i];
		const nextIndex = (i + 1) % shape.points.length;
		const nextPoint = shape.points[nextIndex];

		if (!point || !nextPoint) continue;

		// Find edge modifications for this edge
		const edge = shape.edges.find(
			(e) => e.point1Id === point.id && e.point2Id === nextPoint.id,
		);

		if (edge && edge.edgeModifications.length > 0) {
			// Use shared utility - skip moveTo for all edges except the first
			drawEdgeWithModifications(
				ctx,
				point,
				nextPoint,
				edge.edgeModifications,
				i > 0,
			);
		} else {
			// Simple edge - draw straight line
			if (i === 0) {
				ctx.moveTo(point.xPos, point.yPos);
			}
			ctx.lineTo(nextPoint.xPos, nextPoint.yPos);
		}
	}
};

