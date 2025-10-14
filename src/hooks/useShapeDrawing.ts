import type { KonvaEventObject } from "konva/lib/Node";
import { useState } from "react";
import {
	CardinalDirection,
	type Coordinate,
	DrawingAxis,
} from "~/types/drawing";
import {
	SHAPE_DRAWING_DEFAULT_HEIGHT,
	SHAPE_DRAWING_MIN_DISTANCE,
} from "~/utils/canvas-constants";

export type PreviewShape = {
	startX: number;
	startY: number;
	currentX: number;
	currentY: number;
	changedDirectionPoints: Coordinate[];
	direction: DrawingAxis;
};

const canChangeDirection = (
	point1: Coordinate,
	point2: Coordinate,
	direction: DrawingAxis,
): boolean => {
	if (direction === DrawingAxis.Horizontal) {
		return Math.abs(point1.xPos - point2.xPos) > SHAPE_DRAWING_MIN_DISTANCE;
	}
	return Math.abs(point1.yPos - point2.yPos) > SHAPE_DRAWING_MIN_DISTANCE;
};

const actuallyChangingDirection = (
	canChangeDirection: boolean,
	direction: DrawingAxis,
	currentX: number,
	currentY: number,
	lastX: number,
	lastY: number,
): boolean => {
	if (!canChangeDirection) return false;

	// Check if current distance exceeds minimal offset threshold
	if (direction === DrawingAxis.Vertical) {
		return Math.abs(currentX - lastX) > SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	}
	return Math.abs(currentY - lastY) > SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
};

const returnedFromChangedDirection = (
	shape: PreviewShape,
	lastX: number,
	lastY: number,
): boolean => {
	if (shape.changedDirectionPoints.length > 0) {
		if (shape.direction === DrawingAxis.Horizontal) {
			return (
				Math.abs(getLastChangedStartPoint(shape).xPos - lastX) <
				SHAPE_DRAWING_DEFAULT_HEIGHT / 2
			);
		}
		return (
			Math.abs(getLastChangedStartPoint(shape).yPos - lastY) <
			SHAPE_DRAWING_DEFAULT_HEIGHT / 2
		);
	}
	return false;
};

const getLastChangedStartPoint = (shape: PreviewShape): Coordinate => {
	if (shape.changedDirectionPoints.length > 0) {
		const lastChangedDirectionPoint =
			shape.changedDirectionPoints[shape.changedDirectionPoints.length - 1];
		return {
			xPos: lastChangedDirectionPoint?.xPos || shape.startX,
			yPos: lastChangedDirectionPoint?.yPos || shape.startY,
		};
	}
	return {
		xPos: shape.startX,
		yPos: shape.startY,
	};
};

const getPointDirection = (
	currentPoint: Coordinate,
	nextPoint: Coordinate,
	index: number,
): CardinalDirection | null => {
	if (!currentPoint || !nextPoint) return null;
	// Even indices are horizontal segments, odd indices are vertical
	if (index % 2 === 0) {
		return currentPoint.xPos > nextPoint.xPos
			? CardinalDirection.Left
			: CardinalDirection.Right;
	}
	return currentPoint.yPos > nextPoint.yPos
		? CardinalDirection.Up
		: CardinalDirection.Down;
};

// Calculate offset position for inner/outer edge points based on direction transitions
const calculateOffsetPoint = (
	current: Coordinate,
	next: Coordinate,
	previous: Coordinate,
	index: number,
	isOuter: boolean,
): Coordinate => {
	const nextDir = getPointDirection(current, next, index + 1);
	const prevDir = getPointDirection(previous, current, index);
	
	const offset = SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	const sign = isOuter ? 1 : -1;
	
	// Calculate X offset based on direction transitions
	let xMultiplier = 1;
	if (
		prevDir === CardinalDirection.Right ||
		prevDir === CardinalDirection.Left
	) {
		xMultiplier = nextDir === CardinalDirection.Up ? 1 : -1;
	} else if (prevDir === CardinalDirection.Down) {
		xMultiplier = -1;
	}
	
	// Calculate Y offset based on direction transitions
	let yMultiplier = -1;
	if (prevDir === CardinalDirection.Right) {
		yMultiplier = 1;
	} else if (prevDir === CardinalDirection.Left) {
		yMultiplier = -1;
	} else if (
		prevDir === CardinalDirection.Down ||
		prevDir === CardinalDirection.Up
	) {
		yMultiplier = nextDir === CardinalDirection.Right ? 1 : -1;
	}

	return {
		xPos: current.xPos + sign * xMultiplier * offset,
		yPos: current.yPos + sign * yMultiplier * offset,
	};
};

// Calculate the end cap points for the current drawing position
const getEndCapPoints = (
	currentX: number,
	currentY: number,
	direction: DrawingAxis,
	lastDirection: CardinalDirection | null,
): Coordinate[] => {
	const offset = SHAPE_DRAWING_DEFAULT_HEIGHT / 2;

	if (direction === DrawingAxis.Horizontal) {
		const yOffset = lastDirection === CardinalDirection.Left ? -offset : offset;
		return [
			{ xPos: currentX, yPos: currentY + yOffset },
			{ xPos: currentX, yPos: currentY - yOffset },
		];
	}

	// vertical
	const xOffset = lastDirection === CardinalDirection.Down ? -offset : offset;
	return [
		{ xPos: currentX + xOffset, yPos: currentY },
		{ xPos: currentX - xOffset, yPos: currentY },
	];
};

export function useShapeDrawing(
	zoom: number,
	canvasPosition: { x: number; y: number },
	onComplete?: (shape: {
		xPos: number;
		yPos: number;
		points: Coordinate[];
	}) => void,
) {
	const [previewShape, setPreviewShape] = useState<PreviewShape | null>(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [canChangeDirectionNow, setCanChangeDirectionNow] = useState(false);

	/** Convert screen coordinates to canvas coordinates */
	const screenToCanvas = (screenX: number, screenY: number) => {
		const scale = zoom / 100;
		return {
			x: (screenX - canvasPosition.x) / scale,
			y: (screenY - canvasPosition.y) / scale,
		};
	};

	const handleDrawStart = (e: KonvaEventObject<MouseEvent>) => {
		// Only draw with left click without modifiers
		if (e.evt.button !== 0 || e.evt.shiftKey) return;

		const stage = e.target.getStage();
		if (!stage) return;

		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		const canvasPoint = screenToCanvas(pointer.x, pointer.y);

		// Start drawing new rectangle
		setIsDrawing(true);
		setPreviewShape({
			startX: canvasPoint.x,
			startY: canvasPoint.y,
			currentX: canvasPoint.x,
			currentY: canvasPoint.y,
			changedDirectionPoints: [],
			direction: DrawingAxis.Horizontal,
		});
	};

	const handleDrawMove = (e: KonvaEventObject<MouseEvent>) => {
		const stage = e.target.getStage();
		if (!stage) return;

		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		const canvasPoint = screenToCanvas(pointer.x, pointer.y);

		if (!previewShape) return;

		const canChangeDirectionNowValue = canChangeDirection(
			{
				xPos: getLastChangedStartPoint(previewShape).xPos,
				yPos: getLastChangedStartPoint(previewShape).yPos,
			},
			{ xPos: canvasPoint.x, yPos: canvasPoint.y },
			previewShape.direction,
		);
		setCanChangeDirectionNow(canChangeDirectionNowValue);

		const actuallyChangingDirectionNowValue = actuallyChangingDirection(
			canChangeDirectionNowValue,
			previewShape.direction,
			canvasPoint.x,
			canvasPoint.y,
			getLastChangedStartPoint(previewShape).xPos,
			getLastChangedStartPoint(previewShape).yPos,
		);

		if (actuallyChangingDirectionNowValue) {
			// Calculate the direction change point (locked to current axis)
			const changePointX =
				previewShape.direction === DrawingAxis.Horizontal
					? canvasPoint.x
					: getLastChangedStartPoint(previewShape).xPos;
			const changePointY =
				previewShape.direction === DrawingAxis.Vertical
					? canvasPoint.y
					: getLastChangedStartPoint(previewShape).yPos;
			
			// Switch to the new direction
			const newDirection =
				previewShape.direction === DrawingAxis.Horizontal
					? DrawingAxis.Vertical
					: DrawingAxis.Horizontal;
			
			// Calculate current position for the new direction
			const newCurrentX =
				newDirection === DrawingAxis.Horizontal
					? canvasPoint.x
					: changePointX;
			const newCurrentY =
				newDirection === DrawingAxis.Vertical
					? canvasPoint.y
					: changePointY;
			
			setPreviewShape({
				...previewShape,
				changedDirectionPoints: [
					...previewShape.changedDirectionPoints,
					{ xPos: changePointX, yPos: changePointY },
				],
				direction: newDirection,
				currentX: newCurrentX,
				currentY: newCurrentY,
			});
		} else if (
			returnedFromChangedDirection(previewShape, canvasPoint.x, canvasPoint.y)
		) {
			// Revert to previous direction
			const newDirection =
				previewShape.direction === DrawingAxis.Horizontal
					? DrawingAxis.Vertical
					: DrawingAxis.Horizontal;
			
			// Get the new last point after removing the current one
			const newChangedPoints = previewShape.changedDirectionPoints.slice(0, -1);
			const lastChangedPoint = newChangedPoints[newChangedPoints.length - 1];
			const newLastPoint: Coordinate = lastChangedPoint ?? {
				xPos: previewShape.startX,
				yPos: previewShape.startY,
			};
			
			// Update current position based on the reverted direction
			const newCurrentX =
				newDirection === DrawingAxis.Horizontal
					? canvasPoint.x
					: newLastPoint.xPos;
			const newCurrentY =
				newDirection === DrawingAxis.Vertical
					? canvasPoint.y
					: newLastPoint.yPos;
			
			setPreviewShape({
				...previewShape,
				direction: newDirection,
				changedDirectionPoints: newChangedPoints,
				currentX: newCurrentX,
				currentY: newCurrentY,
			});
		} else {
			setPreviewShape({
				...previewShape,
				currentX:
					previewShape.direction === DrawingAxis.Horizontal
						? canvasPoint.x
						: getLastChangedStartPoint(previewShape).xPos,
				currentY:
					previewShape.direction === DrawingAxis.Vertical
						? canvasPoint.y
						: getLastChangedStartPoint(previewShape).yPos,
			});
		}
	};

	const handleDrawEnd = () => {
		// If we have a valid draft shape, call onComplete before clearing
		if (previewShape && onComplete) {
			const draftBounds = getPreviewBounds();
			if (draftBounds && draftBounds.length > 0) {
				// Find the bounding box to determine shape position
				const xPositions = draftBounds.map((p) => p.xPos);
				const yPositions = draftBounds.map((p) => p.yPos);
				const minX = Math.min(...xPositions);
				const minY = Math.min(...yPositions);

				// Convert absolute points to relative points (relative to shape origin)
				const relativePoints = draftBounds.map((p) => ({
					xPos: p.xPos - minX,
					yPos: p.yPos - minY,
				}));

				onComplete({
					xPos: minX,
					yPos: minY,
					points: relativePoints,
				});
			}
		}

		setPreviewShape(null);
		setIsDrawing(false);
		setCanChangeDirectionNow(false);
	};

	const getCursor = (): string => {
		if (isDrawing) return "crosshair";
		return "default";
	};

	const getLastDirection = (): CardinalDirection | null => {
		if (!previewShape) return null;

		if (previewShape.direction === DrawingAxis.Horizontal) {
			return previewShape.currentX > getLastChangedStartPoint(previewShape).xPos
				? CardinalDirection.Right
				: CardinalDirection.Left;
		}
		return previewShape.currentY > getLastChangedStartPoint(previewShape).yPos
			? CardinalDirection.Down
			: CardinalDirection.Up;
	};

	const getPreviewBounds = (): Coordinate[] | null => {
		if (!previewShape) return null;

		const lastDirection = getLastDirection();
		const offset = SHAPE_DRAWING_DEFAULT_HEIGHT / 2;

		// Calculate outer and inner points for all direction change points
		const { outerPoints, innerPoints } = previewShape.changedDirectionPoints.reduce(
			(acc, point, index) => {
				const nextPoint = previewShape.changedDirectionPoints[index + 1] || {
					xPos: previewShape.currentX,
					yPos: previewShape.currentY,
				};
				const prevPoint = previewShape.changedDirectionPoints[index - 1] || {
					xPos: previewShape.startX,
					yPos: previewShape.startY,
				};

				const outer = calculateOffsetPoint(point, nextPoint, prevPoint, index, true);
				const inner = calculateOffsetPoint(point, nextPoint, prevPoint, index, false);

				acc.outerPoints.push(outer);
				acc.innerPoints.push(inner);

				return acc;
			},
			{ outerPoints: [] as Coordinate[], innerPoints: [] as Coordinate[] },
		);

		// Get the end cap points for the current position
		const endCapPoints = getEndCapPoints(
			previewShape.currentX,
			previewShape.currentY,
			previewShape.direction,
			lastDirection,
		);

		// Build polygon by connecting start → outer edge → end cap → inner edge (reversed for proper winding)
		const coordinates: Coordinate[] = [
			{ xPos: previewShape.startX, yPos: previewShape.startY - offset },
			{ xPos: previewShape.startX, yPos: previewShape.startY + offset },
			...outerPoints,
			...endCapPoints,
			...innerPoints.reverse(),//comment why reverse
		];

		return coordinates
	};

	return {
		handleDrawStart,
		handleDrawMove,
		handleDrawEnd,
		isDrawing,
		getCursor,
		getPreviewBounds,
		previewShape,
		canChangeDirectionNow,
		lastDirection: getLastDirection(),
	};
}
