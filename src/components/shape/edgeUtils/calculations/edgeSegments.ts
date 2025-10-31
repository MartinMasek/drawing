import type { Point, EdgeModificationForCalculation } from "~/types/drawing";
import { EdgeModificationType, EdgeShapePosition } from "@prisma/client";
import { DPI } from "~/utils/canvas-constants";

export interface ModificationSegment {
	modification: EdgeModificationForCalculation;
	startOffset: number;
	endOffset: number;
}

/**
 * Calculate edge vector properties
 * @returns Edge unit vectors, perpendicular vectors, and edge length
 */
export const calculateEdgeVectors = (
	point: Point,
	nextPoint: Point,
): {
	edgeUnitX: number;
	edgeUnitY: number;
	perpX: number;
	perpY: number;
	edgeLength: number;
} => {
	const edgeVectorX = nextPoint.xPos - point.xPos;
	const edgeVectorY = nextPoint.yPos - point.yPos;
	const edgeLength = Math.sqrt(
		edgeVectorX * edgeVectorX + edgeVectorY * edgeVectorY,
	);

	const edgeUnitX = edgeVectorX / edgeLength;
	const edgeUnitY = edgeVectorY / edgeLength;

	// Perpendicular vector (90 degrees counterclockwise)
	const perpX = edgeUnitY;
	const perpY = -edgeUnitX;

	return { edgeUnitX, edgeUnitY, perpX, perpY, edgeLength };
};

/**
 * Calculate segments for all modifications on an edge
 * Determines start and end offsets along the edge for each modification
 * @returns Sorted array of modification segments
 */
export const calculateModificationSegments = (
	modifications: EdgeModificationForCalculation[],
	edgeLength: number,
): ModificationSegment[] => {
	return modifications
		.map((mod) => {
			// FullCurve spans the entire edge
			if (mod.type === EdgeModificationType.FullCurve) {
				return {
					modification: mod,
					startOffset: 0,
					endOffset: edgeLength,
				};
			}

			// Other modifications use width and position
			const widthPixels = mod.width * DPI;
			const distancePixels = mod.distance * DPI;

			let centerOffset = 0;
			switch (mod.position) {
				case EdgeShapePosition.Left:
					centerOffset = distancePixels + widthPixels / 2;
					break;
				case EdgeShapePosition.Right:
					centerOffset = edgeLength - (distancePixels + widthPixels / 2);
					break;
				case EdgeShapePosition.Center:
					centerOffset = edgeLength / 2;
					break;
			}

			return {
				modification: mod,
				startOffset: centerOffset - widthPixels / 2,
				endOffset: centerOffset + widthPixels / 2,
			};
		})
		.sort((a, b) => a.startOffset - b.startOffset);
};

