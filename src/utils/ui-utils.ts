import type { ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { CanvasShape } from "~/types/drawing";
import { DPI } from "./canvas-constants";

/**
 * Utility function for merging and conditionally constructing (Tailwind) classes
 * for more details see https://youtu.be/re2JFITR7TI
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Calculates the area of a shape in square feet using the shoelace formula
 * @param shape - The canvas shape to calculate area for
 * @returns The area in square feet
 */
export function getShapeArea(shape: CanvasShape): number {
	const points = shape.points;

	// Need at least 3 points to form a polygon
	if (points.length < 3) {
		return 0;
	}

	// Shoelace formula to calculate polygon area
	let area = 0;
	for (let i = 0; i < points.length; i++) {
		const j = (i + 1) % points.length;
		const pointI = points[i];
		const pointJ = points[j];

		if (pointI && pointJ) {
			area += pointI.xPos * pointJ.yPos;
			area -= pointJ.xPos * pointI.yPos;
		}
	}
	area = Math.abs(area) / 2;

	// Convert from pixels to square inches (using DPI)
	const squareInches = area / (DPI * DPI);

	// Convert from square inches to square feet
	const squareFeet = squareInches / 144; // 144 square inches = 1 square foot

	return Math.round(squareFeet * 100) / 100; // Round to 2 decimal places
}

export function getTotalAreaOfShapes(shapes: CanvasShape[]): number {
	return shapes.reduce((acc, shape) => acc + getShapeArea(shape), 0);
}
