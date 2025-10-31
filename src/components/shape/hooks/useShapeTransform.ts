import { useMemo } from "react";
import type { CanvasShape, Coordinate } from "~/types/drawing";

interface BoundingBox {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
	centerX: number;
	centerY: number;
}

interface TransformedPoints {
	flattened: number[];
	absolute: Coordinate[];
}

/**
 * Calculate the bounding box and center point of a shape
 */
const calculateBoundingBox = (points: readonly Coordinate[]): BoundingBox => {
	let minX = Number.POSITIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	let maxX = Number.NEGATIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;

	for (const p of points) {
		minX = Math.min(minX, p.xPos);
		minY = Math.min(minY, p.yPos);
		maxX = Math.max(maxX, p.xPos);
		maxY = Math.max(maxY, p.yPos);
	}

	return {
		minX,
		minY,
		maxX,
		maxY,
		centerX: (minX + maxX) / 2,
		centerY: (minY + maxY) / 2,
	};
};

/**
 * Transform shape points to both flattened (for Konva Line) and absolute coordinates
 */
const transformPoints = (
	points: readonly Coordinate[],
	rotation: number,
	shapeX: number,
	shapeY: number,
	centerX: number,
	centerY: number,
	dragOffset: { x: number; y: number },
): TransformedPoints => {
	const flattenedPoints: number[] = [];
	const absolutePoints: Coordinate[] = [];

	const rotationRad = (rotation * Math.PI) / 180;
	const cos = Math.cos(rotationRad);
	const sin = Math.sin(rotationRad);

	for (const p of points) {
		// Flatten for Konva Line component
		flattenedPoints.push(p.xPos, p.yPos);

		// Calculate absolute position with rotation and drag offset
		const relX = p.xPos - centerX;
		const relY = p.yPos - centerY;

		// Apply rotation transformation
		const rotatedX = relX * cos - relY * sin;
		const rotatedY = relX * sin + relY * cos;

		// Translate to world coordinates
		const absX = rotatedX + centerX + shapeX + dragOffset.x;
		const absY = rotatedY + centerY + shapeY + dragOffset.y;

		absolutePoints.push({ xPos: absX, yPos: absY });
	}

	return { flattened: flattenedPoints, absolute: absolutePoints };
};

/**
 * Custom hook for shape geometric transformations
 * Handles bounding box calculation and point transformations
 * Memoized for performance
 */
export const useShapeTransform = (
	shape: CanvasShape,
	dragOffset: { x: number; y: number },
) => {
	const boundingBox = useMemo(
		() => calculateBoundingBox(shape.points),
		[shape.points],
	);

	const { centerX, centerY } = boundingBox;

	const transformedPoints = useMemo(
		() =>
			transformPoints(
				shape.points,
				shape.rotation,
				shape.xPos,
				shape.yPos,
				centerX,
				centerY,
				dragOffset,
			),
		[
			shape.points,
			shape.rotation,
			shape.xPos,
			shape.yPos,
			centerX,
			centerY,
			dragOffset,
		],
	);

	const { flattened: flattenedPoints, absolute: absolutePoints } =
		transformedPoints;

	return {
		boundingBox,
		centerX,
		centerY,
		flattenedPoints,
		absolutePoints,
	};
};

