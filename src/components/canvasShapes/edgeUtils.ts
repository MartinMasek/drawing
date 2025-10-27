import type { Point, EdgeModification, Coordinate } from "~/types/drawing";
import { EdgeModificationType, EdgeShapePosition } from "@prisma/client";
import { DPI } from "~/utils/canvas-constants";
import type { Context } from "konva/lib/Context";

interface ModificationSegment {
	modification: EdgeModification;
	startOffset: number;
	endOffset: number;
}

/**
 * Calculate bump points for both bump-in and bump-out modifications
 * @param inward - true for bump-in (into shape), false for bump-out (out of shape)
 */
export const calculateBumpPoints = (
	mod: EdgeModification,
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

/**
 * Draw bump curve using native canvas curves
 * @param inward - true for bump-in curve (into shape), false for bump-out curve (out of shape)
 */
const drawBumpCurve = (
	ctx: Context,
	mod: EdgeModification,
	startPoint: Point,
	startOffset: number,
	endOffset: number,
	edgeUnitX: number,
	edgeUnitY: number,
	perpX: number,
	perpY: number,
	inward: boolean,
): void => {
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

	// Quarter points for smooth curves
	const quarterWidth = widthPixels / 4;
	const threeQuarterWidth = (widthPixels * 3) / 4;

	// Calculate key points
	const leftQuarterX = startX + edgeUnitX * quarterWidth;
	const leftQuarterY = startY + edgeUnitY * quarterWidth;
	const leftQuarterDeepX = leftQuarterX + direction * perpX * depthPixels;
	const leftQuarterDeepY = leftQuarterY + direction * perpY * depthPixels;

	const midX = startX + edgeUnitX * (widthPixels / 2);
	const midY = startY + edgeUnitY * (widthPixels / 2);
	const midDeepX = midX + direction * perpX * depthPixels;
	const midDeepY = midY + direction * perpY * depthPixels;

	const rightQuarterX = startX + edgeUnitX * threeQuarterWidth;
	const rightQuarterY = startY + edgeUnitY * threeQuarterWidth;
	const rightQuarterDeepX = rightQuarterX + direction * perpX * depthPixels;
	const rightQuarterDeepY = rightQuarterY + direction * perpY * depthPixels;

	// Draw using native quadratic curves
	// Left transition curve
	const leftControlX = startX + direction * perpX * depthPixels * 0.8;
	const leftControlY = startY + direction * perpY * depthPixels * 0.8;
	ctx.quadraticCurveTo(leftControlX, leftControlY, leftQuarterDeepX, leftQuarterDeepY);

	// Middle section curves
	const middleControlX = midDeepX + direction * perpX * depthPixels * 0.2;
	const middleControlY = midDeepY + direction * perpY * depthPixels * 0.2;
	ctx.quadraticCurveTo(middleControlX, middleControlY, midDeepX, midDeepY);

	const rightMiddleControlX = rightQuarterDeepX + direction * perpX * depthPixels * 0.2;
	const rightMiddleControlY = rightQuarterDeepY + direction * perpY * depthPixels * 0.2;
	ctx.quadraticCurveTo(rightMiddleControlX, rightMiddleControlY, rightQuarterDeepX, rightQuarterDeepY);

	// Right transition curve
	const rightControlX = endX + direction * perpX * depthPixels * 0.8;
	const rightControlY = endY + direction * perpY * depthPixels * 0.8;
	ctx.quadraticCurveTo(rightControlX, rightControlY, endX, endY);
};

/**
 * Draw full curve using native canvas curves
 */
const drawFullCurve = (
	ctx: Context,
	mod: EdgeModification,
	startPoint: Point,
	startOffset: number,
	endOffset: number,
	edgeUnitX: number,
	edgeUnitY: number,
	perpX: number,
	perpY: number,
): void => {
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

	// Draw smooth quadratic curve using native canvas method
	ctx.quadraticCurveTo(controlX, controlY, endX, endY);
};

/**
 * Draw modification to canvas context based on type
 */
const drawModification = (
	ctx: Context,
	modification: EdgeModification,
	startPoint: Point,
	startOffset: number,
	endOffset: number,
	edgeUnitX: number,
	edgeUnitY: number,
	perpX: number,
	perpY: number,
): void => {
	switch (modification.type) {
		case EdgeModificationType.BumpIn: {
			const points = calculateBumpPoints(
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
			// Draw straight lines for bump-in
			for (let i = 0; i < points.length; i += 2) {
				const x = points[i];
				const y = points[i + 1];
				if (x !== undefined && y !== undefined) {
					ctx.lineTo(x, y);
				}
			}
			break;
		}
		case EdgeModificationType.BumpOut: {
			const points = calculateBumpPoints(
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
			// Draw straight lines for bump-out
			for (let i = 0; i < points.length; i += 2) {
				const x = points[i];
				const y = points[i + 1];
				if (x !== undefined && y !== undefined) {
					ctx.lineTo(x, y);
				}
			}
			break;
		}
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
 * @param skipMoveTo - If true, doesn't call moveTo (for continuing an existing path)
 */
export const drawEdgeWithModifications = (
	ctx: Context,
	point: Point,
	nextPoint: Point,
	modifications: EdgeModification[],
	skipMoveTo = false,
): void => {
	const edgeVectorX = nextPoint.xPos - point.xPos;
	const edgeVectorY = nextPoint.yPos - point.yPos;
	const edgeLength = Math.sqrt(
		edgeVectorX * edgeVectorX + edgeVectorY * edgeVectorY,
	);

	const edgeUnitX = edgeVectorX / edgeLength;
	const edgeUnitY = edgeVectorY / edgeLength;

	const perpX = edgeUnitY;
	const perpY = -edgeUnitX;

	const segments: ModificationSegment[] = modifications
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
 * Generate all points for an edge with modifications (for database storage)
 * Returns array of coordinates representing the complete edge path
 */
export const generateEdgePoints = (
	point: Point,
	nextPoint: Point,
	modifications: EdgeModification[],
	pointsPerUnit = 0.1, // How many points per pixel for curves
): Coordinate[] => {
	const edgeVectorX = nextPoint.xPos - point.xPos;
	const edgeVectorY = nextPoint.yPos - point.yPos;
	const edgeLength = Math.sqrt(
		edgeVectorX * edgeVectorX + edgeVectorY * edgeVectorY,
	);

	const edgeUnitX = edgeVectorX / edgeLength;
	const edgeUnitY = edgeVectorY / edgeLength;

	const perpX = edgeUnitY;
	const perpY = -edgeUnitX;

	const segments: ModificationSegment[] = modifications
		.map((mod) => {
			if (mod.type === EdgeModificationType.FullCurve) {
				return {
					modification: mod,
					startOffset: 0,
					endOffset: edgeLength,
				};
			}

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

	const points: Coordinate[] = [{ xPos: point.xPos, yPos: point.yPos }];
	let currentOffset = 0;

	for (const segment of segments) {
		// Add straight line points to start of modification if needed
		if (currentOffset < segment.startOffset) {
			const segmentLength = segment.startOffset - currentOffset;
			const numPoints = Math.max(2, Math.ceil(segmentLength * pointsPerUnit));
			
			for (let i = 1; i <= numPoints; i++) {
				const t = i / numPoints;
				const offset = currentOffset + segmentLength * t;
				points.push({
					xPos: point.xPos + edgeUnitX * offset,
					yPos: point.yPos + edgeUnitY * offset,
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
			perpY,
			pointsPerUnit,
		);
		points.push(...modPoints);

		currentOffset = segment.endOffset;
	}

	// Add final segment points if needed
	if (currentOffset < edgeLength) {
		const segmentLength = edgeLength - currentOffset;
		const numPoints = Math.max(2, Math.ceil(segmentLength * pointsPerUnit));
		
		for (let i = 1; i < numPoints; i++) {
			const t = i / numPoints;
			const offset = currentOffset + segmentLength * t;
			points.push({
				xPos: point.xPos + edgeUnitX * offset,
				yPos: point.yPos + edgeUnitY * offset,
			});
		}
		points.push({ xPos: nextPoint.xPos, yPos: nextPoint.yPos });
	}

	return points;
};

/**
 * Generate points for a specific modification
 */
const generateModificationPoints = (
	modification: EdgeModification,
	startPoint: Point,
	startOffset: number,
	endOffset: number,
	edgeUnitX: number,
	edgeUnitY: number,
	perpX: number,
	perpY: number,
	pointsPerUnit: number,
): Coordinate[] => {
	switch (modification.type) {
		case EdgeModificationType.BumpIn:
		case EdgeModificationType.BumpOut: {
			const points = calculateBumpPoints(
				modification,
				startPoint,
				startOffset,
				endOffset,
				edgeUnitX,
				edgeUnitY,
				perpX,
				perpY,
				modification.type === EdgeModificationType.BumpIn,
			);
			const coords: Coordinate[] = [];
			for (let i = 0; i < points.length; i += 2) {
				const x = points[i];
				const y = points[i + 1];
				if (x !== undefined && y !== undefined) {
					coords.push({ xPos: x, yPos: y });
				}
			}
			return coords;
		}
		case EdgeModificationType.BumpInCurve:
		case EdgeModificationType.BumpOutCurve:
			return generateBumpCurvePointsArray(
				modification,
				startPoint,
				startOffset,
				endOffset,
				edgeUnitX,
				edgeUnitY,
				perpX,
				perpY,
				modification.type === EdgeModificationType.BumpInCurve,
				pointsPerUnit,
			);
		case EdgeModificationType.FullCurve:
			return generateFullCurvePointsArray(
				modification,
				startPoint,
				startOffset,
				endOffset,
				edgeUnitX,
				edgeUnitY,
				perpX,
				perpY,
				pointsPerUnit,
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
 * Generate point array for bump curves using quadratic bezier approximation
 */
const generateBumpCurvePointsArray = (
	mod: EdgeModification,
	startPoint: Point,
	startOffset: number,
	endOffset: number,
	edgeUnitX: number,
	edgeUnitY: number,
	perpX: number,
	perpY: number,
	inward: boolean,
	pointsPerUnit: number,
): Coordinate[] => {
	const depthPixels = mod.depth * DPI;
	const widthPixels = mod.width * DPI;
	const direction = inward ? 1 : -1;

	const startX = startPoint.xPos + edgeUnitX * startOffset;
	const startY = startPoint.yPos + edgeUnitY * startOffset;
	const endX = startPoint.xPos + edgeUnitX * endOffset;
	const endY = startPoint.yPos + edgeUnitY * endOffset;

	const quarterWidth = widthPixels / 4;
	const threeQuarterWidth = (widthPixels * 3) / 4;

	// Key points
	const leftQuarterDeepX =
		startX +
		edgeUnitX * quarterWidth +
		direction * perpX * depthPixels;
	const leftQuarterDeepY =
		startY +
		edgeUnitY * quarterWidth +
		direction * perpY * depthPixels;

	const midDeepX =
		startX +
		edgeUnitX * (widthPixels / 2) +
		direction * perpX * depthPixels;
	const midDeepY =
		startY +
		edgeUnitY * (widthPixels / 2) +
		direction * perpY * depthPixels;

	const rightQuarterDeepX =
		startX +
		edgeUnitX * threeQuarterWidth +
		direction * perpX * depthPixels;
	const rightQuarterDeepY =
		startY +
		edgeUnitY * threeQuarterWidth +
		direction * perpY * depthPixels;

	// Generate curve points
	const points: Coordinate[] = [];
	
	// Left curve
	const leftControlX = startX + direction * perpX * depthPixels * 0.8;
	const leftControlY = startY + direction * perpY * depthPixels * 0.8;
	points.push(...sampleQuadraticBezier(
		startX, startY,
		leftControlX, leftControlY,
		leftQuarterDeepX, leftQuarterDeepY,
		Math.max(5, Math.ceil(depthPixels * pointsPerUnit))
	));

	// Middle curves
	const middleControlX = midDeepX + direction * perpX * depthPixels * 0.2;
	const middleControlY = midDeepY + direction * perpY * depthPixels * 0.2;
	points.push(...sampleQuadraticBezier(
		leftQuarterDeepX, leftQuarterDeepY,
		middleControlX, middleControlY,
		midDeepX, midDeepY,
		Math.max(5, Math.ceil(widthPixels * 0.25 * pointsPerUnit))
	));

	const rightMiddleControlX = rightQuarterDeepX + direction * perpX * depthPixels * 0.2;
	const rightMiddleControlY = rightQuarterDeepY + direction * perpY * depthPixels * 0.2;
	points.push(...sampleQuadraticBezier(
		midDeepX, midDeepY,
		rightMiddleControlX, rightMiddleControlY,
		rightQuarterDeepX, rightQuarterDeepY,
		Math.max(5, Math.ceil(widthPixels * 0.25 * pointsPerUnit))
	));

	// Right curve
	const rightControlX = endX + direction * perpX * depthPixels * 0.8;
	const rightControlY = endY + direction * perpY * depthPixels * 0.8;
	points.push(...sampleQuadraticBezier(
		rightQuarterDeepX, rightQuarterDeepY,
		rightControlX, rightControlY,
		endX, endY,
		Math.max(5, Math.ceil(depthPixels * pointsPerUnit))
	));

	return points;
};

/**
 * Generate point array for full curves
 */
const generateFullCurvePointsArray = (
	mod: EdgeModification,
	startPoint: Point,
	startOffset: number,
	endOffset: number,
	edgeUnitX: number,
	edgeUnitY: number,
	perpX: number,
	perpY: number,
	pointsPerUnit: number,
): Coordinate[] => {
	const depthPixels = -mod.fullRadiusDepth * DPI;

	const startX = startPoint.xPos + edgeUnitX * startOffset;
	const startY = startPoint.yPos + edgeUnitY * startOffset;
	const endX = startPoint.xPos + edgeUnitX * endOffset;
	const endY = startPoint.yPos + edgeUnitY * endOffset;

	const midOffset = (startOffset + endOffset) / 2;
	const midEdgeX = startPoint.xPos + edgeUnitX * midOffset;
	const midEdgeY = startPoint.yPos + edgeUnitY * midOffset;

	const controlX = midEdgeX + perpX * depthPixels;
	const controlY = midEdgeY + perpY * depthPixels;

	const edgeLength = endOffset - startOffset;
	return sampleQuadraticBezier(
		startX, startY,
		controlX, controlY,
		endX, endY,
		Math.max(10, Math.ceil(edgeLength * pointsPerUnit))
	);
};

/**
 * Sample points along a quadratic Bezier curve
 */
const sampleQuadraticBezier = (
	startX: number,
	startY: number,
	controlX: number,
	controlY: number,
	endX: number,
	endY: number,
	numSamples: number,
): Coordinate[] => {
	const points: Coordinate[] = [];
	
	for (let i = 1; i <= numSamples; i++) {
		const t = i / numSamples;
		const mt = 1 - t;
		
		const x = mt * mt * startX + 2 * mt * t * controlX + t * t * endX;
		const y = mt * mt * startY + 2 * mt * t * controlY + t * t * endY;
		
		points.push({ xPos: x, yPos: y });
	}
	
	return points;
};

