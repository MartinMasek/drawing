import { EdgeModificationType, EdgeShapePosition } from "@prisma/client";

// Minimal edge interface for validation (works with both Prisma and CanvasShape edges)
interface EdgeForValidation {
	edgeModifications?: Array<{ type: EdgeModificationType; position: EdgeShapePosition }>;
}

/**
 * Check if a new modification can be added to an edge
 * Validates against FullCurve exclusivity, max 2 modifications, and position conflicts
 */
export function canAddModification(
	edge: EdgeForValidation | undefined,
	newPosition: EdgeShapePosition,
): { allowed: boolean; reason?: string } {
	if (!edge || !edge.edgeModifications || edge.edgeModifications.length === 0) {
		return { allowed: true };
	}

	const mods = edge.edgeModifications;

	// Check for FullCurve (exclusive - occupies entire edge)
	if (mods.some((m) => m.type === EdgeModificationType.FullCurve)) {
		return { allowed: false, reason: "FullCurve occupies entire edge" };
	}

	// Max 2 modifications per edge
	if (mods.length >= 2) {
		return { allowed: false, reason: "Maximum 2 modifications per edge" };
	}

	// Check position conflict
	if (mods.some((m) => m.position === newPosition)) {
		return { allowed: false, reason: "Position already occupied" };
	}

	return { allowed: true };
}

/**
 * Calculate the best available position for a new modification
 * Prefers the user's preferred position, falls back to first available
 * Default priority: Left, Center, Right (when Center is occupied, default to Left)
 */
export function calculateAvailablePosition(
	edge: EdgeForValidation | undefined,
	preferredPosition: EdgeShapePosition,
): EdgeShapePosition {
	if (!edge || !edge.edgeModifications || edge.edgeModifications.length === 0) {
		return preferredPosition;
	}

	const occupied = edge.edgeModifications.map((m) => m.position);

	// If preferred position is available, use it
	if (!occupied.includes(preferredPosition)) {
		return preferredPosition;
	}

	// Fallback: When Center is occupied, default to Left
	// Priority order: Left, Center, Right
	const positions = [
		EdgeShapePosition.Left,
		EdgeShapePosition.Center,
		EdgeShapePosition.Right,
	];
	return (
		positions.find((p) => !occupied.includes(p)) ?? EdgeShapePosition.Center
	);
}

/**
 * Get all available positions for a new modification on an edge
 * Returns empty array if edge is full or has FullCurve
 */
export function getAvailablePositions(
	edgeModifications: Array<{ type: EdgeModificationType; position: EdgeShapePosition }> | undefined,
): EdgeShapePosition[] {
	if (!edgeModifications || edgeModifications.length === 0) {
		return [
			EdgeShapePosition.Left,
			EdgeShapePosition.Center,
			EdgeShapePosition.Right,
		];
	}

	// FullCurve occupies entire edge - no positions available
	if (edgeModifications.some((m) => m.type === EdgeModificationType.FullCurve)) {
		return [];
	}

	// Max 2 modifications - return empty if full
	if (edgeModifications.length >= 2) {
		return [];
	}

	const occupied = edgeModifications.map((m) => m.position);
	return [
		EdgeShapePosition.Left,
		EdgeShapePosition.Center,
		EdgeShapePosition.Right,
	].filter((p) => !occupied.includes(p));
}
