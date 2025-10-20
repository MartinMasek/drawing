import type { Coordinate } from "~/types/drawing";

/**
 * Calculate which points in a shape's polygon represent the start and end edges.
 * 
 * The shape polygon structure from useShapeDrawing is:
 * - [0, 1]: Start cap points (perpendicular edge at drawing start)
 * - [2, ..., 2+n-1]: Outer edge corner points (n = number of direction changes, can be 0)
 * - [2+n, 2+n+1]: End cap points (perpendicular edge at drawing end)  
 * - [2+n+2, ...]: Inner edge points (reversed, including corners)
 * 
 * Total points = 2 (start cap) + n (outer corners) + 2 (end cap) + n (inner corners)
 * For a straight line (n=0): 4 points total [start cap + end cap]
 * 
 * This function determines the indices by analyzing the structure.
 * 
 * @param points - Array of polygon points in winding order
 * @returns Object with start and end point indices, or null if shape is too small
 */
export function getShapeEdgePointIndices(
	points: ReadonlyArray<Coordinate> | Coordinate[]
): { startPoint1: number; startPoint2: number; endPoint1: number; endPoint2: number } | null {
	// Need at least 4 points for a valid shape (2 start cap + 2 end cap, for a straight line)
	if (points.length < 4) return null;

	// Start edge is always the first 2 points
	const startPoint1 = 0;
	const startPoint2 = 1;

	// Calculate number of direction change points (outer corners)
	// Formula: total points = 2 (start) + n (outer) + 2 (end) + n (inner)
	// Simplifying: total = 4 + 2n
	// Therefore: n = (total - 4) / 2
	const totalPoints = points.length;
	const outerCornerCount = (totalPoints - 4) / 2;

	// End cap indices
	const endPoint1 = 2 + outerCornerCount;
	const endPoint2 = 2 + outerCornerCount + 1;

	// Validate the calculated indices
	if (endPoint2 >= totalPoints || outerCornerCount < 0 || !Number.isInteger(outerCornerCount)) {
		// Fallback: use midpoint heuristic
		const midPoint = Math.floor(totalPoints / 2);
		return {
			startPoint1,
			startPoint2,
			endPoint1: midPoint,
			endPoint2: midPoint + 1 < totalPoints ? midPoint + 1 : midPoint,
		};
	}

	return {
		startPoint1,
		startPoint2,
		endPoint1,
		endPoint2,
	};
}

