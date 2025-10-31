import type { Point, EdgeModificationForCalculation, Coordinate } from "~/types/drawing";
import { EdgeModificationType } from "@prisma/client";
import {
	calculateEdgeVectors,
	calculateModificationSegments,
} from "../calculations/edgeSegments";
import {
	generateBumpStraightPoints,
	generateBumpCurvePoints,
} from "./generateBumpPoints";
import { generateFullCurvePoints } from "./generateCurvePoints";

/**
 * Generate points for a specific modification for database storage
 */
const generateModificationPoints = (
	modification: EdgeModificationForCalculation,
	startPoint: Point,
	startOffset: number,
	endOffset: number,
	edgeUnitX: number,
	edgeUnitY: number,
	perpX: number,
	perpY: number,
): Coordinate[] => {
	switch (modification.type) {
		case EdgeModificationType.BumpIn:
			return generateBumpStraightPoints(
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
		case EdgeModificationType.BumpOut:
			return generateBumpStraightPoints(
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
		case EdgeModificationType.BumpInCurve:
		case EdgeModificationType.BumpOutCurve:
			return generateBumpCurvePoints(
				modification,
				startPoint,
				startOffset,
				endOffset,
				edgeUnitX,
				edgeUnitY,
			);
		case EdgeModificationType.FullCurve:
			return generateFullCurvePoints(
				modification,
				startPoint,
				startOffset,
				endOffset,
				edgeUnitX,
				edgeUnitY,
			);
		case EdgeModificationType.None:
			return [
				{
					xPos: startPoint.xPos + edgeUnitX * endOffset,
					yPos: startPoint.yPos + edgeUnitY * endOffset,
				},
			];
	}
};

/**
 * Generate all points for an edge with modifications (for database storage)
 * Returns array of coordinates representing ONLY the intermediate points
 * NOTE: Does NOT include start/end points - those are the shape vertices
 * 
 * Main exported function for generating points to store in the database
 */
export const generateEdgePoints = (
	point: Point,
	nextPoint: Point,
	modifications: EdgeModificationForCalculation[],
): Coordinate[] => {
	const { edgeUnitX, edgeUnitY, perpX, perpY, edgeLength } =
		calculateEdgeVectors(point, nextPoint);

	const segments = calculateModificationSegments(modifications, edgeLength);

	const points: Coordinate[] = [];
	let currentOffset = 0;

	for (const segment of segments) {
		// Add straight line to start of modification if needed
		if (currentOffset < segment.startOffset) {
			// Only add if not at the very start (would duplicate shape vertex)
			if (segment.startOffset > 0.01) {
				points.push({
					xPos: point.xPos + edgeUnitX * segment.startOffset,
					yPos: point.yPos + edgeUnitY * segment.startOffset,
				});
			}
		}

		// Add modification points
		const modPoints = generateModificationPoints(
			segment.modification,
			point,
			segment.startOffset,
			segment.endOffset,
			edgeUnitX,
			edgeUnitY,
			perpX,
			perpY
		);
		points.push(...modPoints);

		currentOffset = segment.endOffset;
	}

	// The modification's last point is already at currentOffset
	// Edge.tsx will add the final shape vertex, so we're done
	return points;
};

