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
	SHAPE_DRAWING_MIN_START_DISTANCE,
} from "~/utils/canvas-constants";

export type PreviewShape = {
	startX: number;
	startY: number;
	currentX: number;
	currentY: number;
	changedDirectionPoints: Coordinate[];
	direction: DrawingAxis;
};

type CanvasPoint = {
	x: number;
	y: number;
};


const HALF_HEIGHT = SHAPE_DRAWING_DEFAULT_HEIGHT / 2;

/**
 * Get the perpendicular axis for the given axis
 */
const getPerpendicularAxis = (axis: DrawingAxis): DrawingAxis => {
	return axis === DrawingAxis.Horizontal
		? DrawingAxis.Vertical
		: DrawingAxis.Horizontal;
};

/**
 * Get the last direction change point, or the starting point if no changes yet
 */
const getLastDirectionPoint = (shape: PreviewShape): Coordinate => {
	const lastPoint = shape.changedDirectionPoints[shape.changedDirectionPoints.length - 1];
	
	if (lastPoint) {
		return lastPoint;
	}
	
	return {
		xPos: shape.startX,
		yPos: shape.startY,
	};
};

/**
 * Get the first direction change point, or the current position if no changes yet
 */
const getFirstTargetPoint = (shape: PreviewShape): Coordinate => {
	const firstPoint = shape.changedDirectionPoints[0];
	
	if (firstPoint) {
		return firstPoint;
	}
	
	return {
		xPos: shape.currentX,
		yPos: shape.currentY,
	};
};

/**
 * Derive the initial axis from the shape's current state
 * If no direction changes yet, use current direction
 * Otherwise, work backwards: each direction change toggles the axis
 */
const getInitialAxis = (shape: PreviewShape): DrawingAxis => {
	const changeCount = shape.changedDirectionPoints.length;
	
	// If no changes, initial axis is current direction
	if (changeCount === 0) {
		return shape.direction;
	}
	
	// Each direction change toggles between horizontal and vertical
	// So if odd number of changes, initial is opposite of current
	// If even number of changes, initial is same as current
	return changeCount % 2 === 0
		? shape.direction
		: getPerpendicularAxis(shape.direction);
};

/**
 * Check if the minimum distance has been traveled to allow a direction change
 */
const hasMinimumDistanceForDirectionChange = (
	from: Coordinate,
	to: Coordinate,
	currentAxis: DrawingAxis,
): boolean => {
	const distance = currentAxis === DrawingAxis.Horizontal
		? Math.abs(from.xPos - to.xPos)
		: Math.abs(from.yPos - to.yPos);
	
	return distance > SHAPE_DRAWING_MIN_DISTANCE;
};

/**
 * Check if user has moved far enough perpendicular to current axis to trigger direction change
 */
const shouldTriggerDirectionChange = (
	hasMinDistance: boolean,
	currentAxis: DrawingAxis,
	currentPoint: CanvasPoint,
	lastPoint: Coordinate,
): boolean => {
	if (!hasMinDistance) return false;

	// Check perpendicular axis movement (the axis we'd switch to)
	const perpendicularDistance = currentAxis === DrawingAxis.Vertical
		? Math.abs(currentPoint.x - lastPoint.xPos)
		: Math.abs(currentPoint.y - lastPoint.yPos);
	
	return perpendicularDistance > HALF_HEIGHT;
};

/**
 * Check if user has backtracked close enough to undo the last direction change
 */
const shouldRevertDirectionChange = (
	shape: PreviewShape,
	currentPoint: CanvasPoint,
): boolean => {
	if (shape.changedDirectionPoints.length === 0) return false;

	const lastPoint = getLastDirectionPoint(shape);
	const distance = shape.direction === DrawingAxis.Horizontal
		? Math.abs(lastPoint.xPos - currentPoint.x)
		: Math.abs(lastPoint.yPos - currentPoint.y);
	
	return distance < HALF_HEIGHT;
};

/**
 * Check if user is close enough to start to allow switching the initial axis
 * Only applicable when no direction changes have been made yet
 */
const shouldSwitchInitialAxis = (
	shape: PreviewShape,
	currentPoint: CanvasPoint,
): boolean => {
	// Only allow switching before any direction changes
	if (shape.changedDirectionPoints.length > 0) return false;

	// Check if user has moved more on the perpendicular axis than the current axis
	const deltaX = Math.abs(currentPoint.x - shape.startX);
	const deltaY = Math.abs(currentPoint.y - shape.startY);

	// If drawing horizontal but moved more vertically, switch to vertical
	if (shape.direction === DrawingAxis.Horizontal && deltaY > deltaX) {
		return deltaY > SHAPE_DRAWING_MIN_START_DISTANCE;
	}

	// If drawing vertical but moved more horizontally, switch to horizontal
	if (shape.direction === DrawingAxis.Vertical && deltaX > deltaY) {
		return deltaX > SHAPE_DRAWING_MIN_START_DISTANCE;
	}

	return false;
};

/**
 * Determine the cardinal direction from one point to another based on segment index
 * Even indices = horizontal segments, odd indices = vertical segments
 */
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

/**
 * Calculate offset position for inner/outer edge points based on direction transitions
 * This creates the perpendicular offset needed to form the shape's width
 */
const calculateOffsetPoint = (
	current: Coordinate,
	next: Coordinate,
	previous: Coordinate,
	index: number,
	isOuter: boolean,
): Coordinate => {
	const nextDir = getPointDirection(current, next, index + 1);
	const prevDir = getPointDirection(previous, current, index);
	
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
		xPos: current.xPos + sign * xMultiplier * HALF_HEIGHT,
		yPos: current.yPos + sign * yMultiplier * HALF_HEIGHT,
	};
};

/**
 * Calculate the start cap points for the leading edge of the shape
 * Forms the perpendicular termination at the starting position
 * Cap winding order depends on initial direction to prevent edge crossing
 */
const getStartCapPoints = (
	startX: number,
	startY: number,
	initialDirection: CardinalDirection | null,
): Coordinate[] => {
	if (initialDirection === CardinalDirection.Left) {
		// Horizontal left - reversed vertical cap
		return [
			{ xPos: startX, yPos: startY + HALF_HEIGHT },
			{ xPos: startX, yPos: startY - HALF_HEIGHT },
		];
	}
	
	if (initialDirection === CardinalDirection.Right) {
		// Horizontal right - normal vertical cap
		return [
			{ xPos: startX, yPos: startY - HALF_HEIGHT },
			{ xPos: startX, yPos: startY + HALF_HEIGHT },
		];
	}
	
	if (initialDirection === CardinalDirection.Up) {
		// Vertical up - reversed horizontal cap
		return [
			{ xPos: startX - HALF_HEIGHT, yPos: startY },
			{ xPos: startX + HALF_HEIGHT, yPos: startY },
		];
	}
	
	// Vertical down - normal horizontal cap
	return [
		{ xPos: startX + HALF_HEIGHT, yPos: startY },
		{ xPos: startX - HALF_HEIGHT, yPos: startY },
	];
};

/**
 * Calculate the end cap points for the trailing edge of the shape
 * Forms the perpendicular termination at the current drawing position
 */
const getEndCapPoints = (
	currentX: number,
	currentY: number,
	direction: DrawingAxis,
	lastDirection: CardinalDirection | null,
): Coordinate[] => {
	if (direction === DrawingAxis.Horizontal) {
		const yOffset = lastDirection === CardinalDirection.Left ? -HALF_HEIGHT : HALF_HEIGHT;
		return [
			{ xPos: currentX, yPos: currentY + yOffset },
			{ xPos: currentX, yPos: currentY - yOffset },
		];
	}

	// Vertical direction
	const xOffset = lastDirection === CardinalDirection.Down ? -HALF_HEIGHT : HALF_HEIGHT;
	return [
		{ xPos: currentX + xOffset, yPos: currentY },
		{ xPos: currentX - xOffset, yPos: currentY },
	];
};

/**
 * Hook for interactive orthogonal shape drawing on a canvas
 * 
 * Enables users to draw shapes with alternating horizontal/vertical segments.
 * The shape automatically switches between axes when the user moves perpendicular
 * to the current drawing direction, creating smooth L-shaped or zigzag patterns.
 * 
 * @param zoom - Current zoom level as a percentage (100 = 1x)
 * @param canvasPosition - Current pan offset of the canvas {x, y}
 * @param onComplete - Callback invoked when drawing completes with final shape data
 * @returns Drawing state and event handlers for canvas integration
 */
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
	const [pendingStartPoint, setPendingStartPoint] = useState<CanvasPoint | null>(null);

	/** Convert screen coordinates to canvas coordinates accounting for zoom and pan */
	const screenToCanvas = (screenX: number, screenY: number): CanvasPoint => {
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

		// Record the initial click position but don't start drawing yet
		// Drawing will begin once user drags beyond minimum distance
		setPendingStartPoint(canvasPoint);
	};

	/**
	 * Add a new direction change point and switch to perpendicular axis
	 * Locks the change point to the current axis for clean orthogonal transitions
	 */
	const applyDirectionChange = (
		shape: PreviewShape,
		canvasPoint: CanvasPoint,
	): PreviewShape => {
		const lastPoint = getLastDirectionPoint(shape);
		
		// Lock change point to current axis
		const changePoint: Coordinate = {
			xPos: shape.direction === DrawingAxis.Horizontal
				? canvasPoint.x
				: lastPoint.xPos,
			yPos: shape.direction === DrawingAxis.Vertical
				? canvasPoint.y
				: lastPoint.yPos,
		};
		
		const newDirection = getPerpendicularAxis(shape.direction);
		
		// Position on new axis follows mouse, locked axis uses change point
		const newPosition: CanvasPoint = {
			x: newDirection === DrawingAxis.Horizontal ? canvasPoint.x : changePoint.xPos,
			y: newDirection === DrawingAxis.Vertical ? canvasPoint.y : changePoint.yPos,
		};
		
		return {
			...shape,
			changedDirectionPoints: [...shape.changedDirectionPoints, changePoint],
			direction: newDirection,
			currentX: newPosition.x,
			currentY: newPosition.y,
		};
	};

	/**
	 * Remove the last direction change point and revert to previous axis
	 * Triggered when user backtracks close to the last change point
	 */
	const revertLastDirectionChange = (
		shape: PreviewShape,
		canvasPoint: CanvasPoint,
	): PreviewShape => {
		const newChangedPoints = shape.changedDirectionPoints.slice(0, -1);
		const newDirection = getPerpendicularAxis(shape.direction);
		
		// Find the anchor point after removing the last direction change
		const anchorPoint: Coordinate = newChangedPoints[newChangedPoints.length - 1] ?? {
			xPos: shape.startX,
			yPos: shape.startY,
		};
		
		// Position on reverted axis follows mouse, locked axis uses anchor
		const newPosition: CanvasPoint = {
			x: newDirection === DrawingAxis.Horizontal ? canvasPoint.x : anchorPoint.xPos,
			y: newDirection === DrawingAxis.Vertical ? canvasPoint.y : anchorPoint.yPos,
		};
		
		return {
			...shape,
			direction: newDirection,
			changedDirectionPoints: newChangedPoints,
			currentX: newPosition.x,
			currentY: newPosition.y,
		};
	};

	/**
	 * Update current position while continuing in the same direction
	 * Follows mouse on active axis, remains locked on perpendicular axis
	 */
	const updatePositionInCurrentDirection = (
		shape: PreviewShape,
		canvasPoint: CanvasPoint,
	): PreviewShape => {
		const anchorPoint = getLastDirectionPoint(shape);
		
		return {
			...shape,
			currentX: shape.direction === DrawingAxis.Horizontal
				? canvasPoint.x
				: anchorPoint.xPos,
			currentY: shape.direction === DrawingAxis.Vertical
				? canvasPoint.y
				: anchorPoint.yPos,
		};
	};

	/**
	 * Switch the initial drawing axis before any direction changes are made
	 * Allows user to change their mind about the initial direction
	 */
	const switchInitialAxis = (
		shape: PreviewShape,
		canvasPoint: CanvasPoint,
	): PreviewShape => {
		const newDirection = getPerpendicularAxis(shape.direction);
		
		return {
			...shape,
			direction: newDirection,
			currentX: newDirection === DrawingAxis.Horizontal 
				? canvasPoint.x 
				: shape.startX,
			currentY: newDirection === DrawingAxis.Vertical 
				? canvasPoint.y 
				: shape.startY,
		};
	};

	const handleDrawMove = (e: KonvaEventObject<MouseEvent>) => {
		const stage = e.target.getStage();
		if (!stage) return;

		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		const canvasPoint = screenToCanvas(pointer.x, pointer.y);

		// If we have a pending start point but haven't started drawing yet
		if (pendingStartPoint && !previewShape) {
			const distance = Math.sqrt(
				(canvasPoint.x - pendingStartPoint.x) ** 2 +
				(canvasPoint.y - pendingStartPoint.y) ** 2
			);

			// Start drawing once minimum distance threshold is exceeded
			if (distance >= SHAPE_DRAWING_MIN_START_DISTANCE) {
				// Determine initial axis based on which direction has more movement
				const deltaX = Math.abs(canvasPoint.x - pendingStartPoint.x);
				const deltaY = Math.abs(canvasPoint.y - pendingStartPoint.y);
				const initialAxis = deltaY > deltaX 
					? DrawingAxis.Vertical 
					: DrawingAxis.Horizontal;

				// Lock position on the perpendicular axis
				const currentX = initialAxis === DrawingAxis.Horizontal 
					? canvasPoint.x 
					: pendingStartPoint.x;
				const currentY = initialAxis === DrawingAxis.Vertical 
					? canvasPoint.y 
					: pendingStartPoint.y;

				setIsDrawing(true);
				setPreviewShape({
					startX: pendingStartPoint.x,
					startY: pendingStartPoint.y,
					currentX,
					currentY,
					changedDirectionPoints: [],
					direction: initialAxis,
				});
				setPendingStartPoint(null);
			}
			return;
		}

		// Continue with existing drawing logic if already drawing
		if (!previewShape) return;
		
		// Check if user wants to switch the initial axis before making any direction changes
		const shouldSwitchAxis = shouldSwitchInitialAxis(previewShape, canvasPoint);
		
		if (shouldSwitchAxis) {
			setPreviewShape(switchInitialAxis(previewShape, canvasPoint));
			return;
		}

		const lastPoint = getLastDirectionPoint(previewShape);

		// Check if minimum distance traveled to allow direction change
		const hasMinDistance = hasMinimumDistanceForDirectionChange(
			lastPoint,
			{ xPos: canvasPoint.x, yPos: canvasPoint.y },
			previewShape.direction,
		);
		setCanChangeDirectionNow(hasMinDistance);

		// Check if user is triggering a direction change
		const shouldChange = shouldTriggerDirectionChange(
			hasMinDistance,
			previewShape.direction,
			canvasPoint,
			lastPoint,
		);

		// Check if user is reverting the last direction change
		const shouldRevert = shouldRevertDirectionChange(previewShape, canvasPoint);

		// Apply appropriate state update based on user action
		if (shouldChange) {
			setPreviewShape(applyDirectionChange(previewShape, canvasPoint));
		} else if (shouldRevert) {
			setPreviewShape(revertLastDirectionChange(previewShape, canvasPoint));
		} else {
			setPreviewShape(updatePositionInCurrentDirection(previewShape, canvasPoint));
		}
	};

	const handleDrawEnd = () => {
		// Clear pending start point if user released before reaching minimum distance
		if (pendingStartPoint) {
			setPendingStartPoint(null);
			return;
		}

		if (!previewShape) {
			setIsDrawing(false);
			setCanChangeDirectionNow(false);
			return;
		}

		// Finalize shape if we have valid bounds and a completion callback
		if (onComplete) {
			const bounds = getPreviewBounds();
			if (bounds && bounds.length > 0) {
				// Calculate bounding box to determine shape origin
				const xPositions = bounds.map((p) => p.xPos);
				const yPositions = bounds.map((p) => p.yPos);
				const minX = Math.min(...xPositions);
				const minY = Math.min(...yPositions);

				// Convert absolute coordinates to relative coordinates
				const relativePoints = bounds.map((p) => ({
					xPos: p.xPos - minX,
					yPos: p.yPos - minY,
				}));

				// Start and end point indices will be calculated on the backend
				// using getShapeEdgePointIndices utility function
				onComplete({
					xPos: minX,
					yPos: minY,
					points: relativePoints,
				});
			}
		}

		// Reset drawing state
		setPreviewShape(null);
		setIsDrawing(false);
		setCanChangeDirectionNow(false);
	};


	/** Get the appropriate cursor style based on drawing state */
	const getCursor = (): string => {
		return isDrawing ? "crosshair" : "default";
	};

	/** Determine the cardinal direction of the current drawing segment */
	const getLastDirection = (): CardinalDirection | null => {
		if (!previewShape) return null;

		const anchorPoint = getLastDirectionPoint(previewShape);

		if (previewShape.direction === DrawingAxis.Horizontal) {
			return previewShape.currentX > anchorPoint.xPos
				? CardinalDirection.Right
				: CardinalDirection.Left;
		}
		
		return previewShape.currentY > anchorPoint.yPos
			? CardinalDirection.Down
			: CardinalDirection.Up;
	};

	/**
	 * Calculate the polygon boundary points for the current preview shape
	 * Forms a closed polygon with proper winding order for rendering
	 */
	const getPreviewBounds = (): Coordinate[] | null => {
		if (!previewShape) return null;

		const lastDirection = getLastDirection();

		// Calculate offset points along outer and inner edges at each direction change
		// Segment index offset: if we started vertically, add 1 to all indices
		// This is because getPointDirection expects even indices for horizontal, odd for vertical
		const initialAxis = getInitialAxis(previewShape);
		const segmentIndexOffset = initialAxis === DrawingAxis.Vertical ? 1 : 0;
		
		const { outerPoints, innerPoints } = previewShape.changedDirectionPoints.reduce(
			(acc, point, index) => {
				// Next point is either the next direction change or current cursor position
				const nextPoint = previewShape.changedDirectionPoints[index + 1] ?? {
					xPos: previewShape.currentX,
					yPos: previewShape.currentY,
				};
				
				// Previous point is either the previous direction change or start position
				const prevPoint = previewShape.changedDirectionPoints[index - 1] ?? {
					xPos: previewShape.startX,
					yPos: previewShape.startY,
				};

				// Adjust segment index if we started vertically
				const segmentIndex = index + segmentIndexOffset;
				const outer = calculateOffsetPoint(point, nextPoint, prevPoint, segmentIndex, true);
				const inner = calculateOffsetPoint(point, nextPoint, prevPoint, segmentIndex, false);

				acc.outerPoints.push(outer);
				acc.innerPoints.push(inner);

				return acc;
			},
			{ outerPoints: [] as Coordinate[], innerPoints: [] as Coordinate[] },
		);

		// Calculate the end cap at the current cursor position
		const endCapPoints = getEndCapPoints(
			previewShape.currentX,
			previewShape.currentY,
			previewShape.direction,
			lastDirection,
		);

		// Determine initial direction and calculate start cap points
		const startPoint: Coordinate = {
			xPos: previewShape.startX,
			yPos: previewShape.startY,
		};
		const firstTargetPoint = getFirstTargetPoint(previewShape);
		
		// Get initial direction using the correct segment index
		// Index 0 = horizontal segment, index 1 = vertical segment
		const initialSegmentIndex = initialAxis === DrawingAxis.Vertical ? 1 : 0;
		const initialDirection = getPointDirection(startPoint, firstTargetPoint, initialSegmentIndex);

		// Build start cap with proper winding based on initial direction
		const startCapPoints = getStartCapPoints(
			previewShape.startX,
			previewShape.startY,
			initialDirection,
		);

		// Build closed polygon: start cap → outer edge → end cap → inner edge (reversed)
		// Inner points are reversed to maintain counter-clockwise winding for proper rendering
		const coordinates: Coordinate[] = [
			...startCapPoints,
			...outerPoints,
			...endCapPoints,
			...innerPoints.reverse(),
		];

		return coordinates;
	};

	return {
		// Event handlers for Konva stage integration
		handleDrawStart,
		handleDrawMove,
		handleDrawEnd,
		
		// Drawing state
		isDrawing,
		previewShape,
		canChangeDirectionNow,
		
		// Derived values
		getCursor,
		getPreviewBounds,
		lastDirection: getLastDirection(),
	};
}
