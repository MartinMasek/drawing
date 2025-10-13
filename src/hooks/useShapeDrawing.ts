import type { KonvaEventObject } from "konva/lib/Node";
import { useState } from "react";
import type { CanvasShape, Point } from "~/types/drawing";
import {
	SHAPE_DRAWING_DEFAULT_HEIGHT,
	SHAPE_DRAWING_MIN_DISTANCE,
} from "~/utils/canvas-constants";

type DraftShape = {
	startX: number;
	startY: number;
	currentX: number;
	currentY: number;
	changedDirectionPoints: Array<{ xPos: number; yPos: number }>;
	direction: "horizontal" | "vertical";
};

const canChangeDirection = (
	point1: { xPos: number; yPos: number },
	point2: { xPos: number; yPos: number },
	direction: "horizontal" | "vertical",
) => {
	if (direction === "horizontal") {
		return Math.abs(point1.xPos - point2.xPos) > SHAPE_DRAWING_MIN_DISTANCE;
	}
	return Math.abs(point1.yPos - point2.yPos) > SHAPE_DRAWING_MIN_DISTANCE;
};

const actualyChangingDirection = (
	canChangeDirection: boolean,
	direction: "horizontal" | "vertical",
	currentX: number,
	currentY: number,
	lastX: number,
	lastY: number,
) => {
	if (!canChangeDirection) return false;

	// is current distance out of minimal height?
	if (direction === "vertical") {
		return Math.abs(currentX - lastX) >= SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	}
	return Math.abs(currentY - lastY) >= SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
};

const returnedFromChangedDirection = (
	shape: DraftShape,
	lastX: number,
	lastY: number,
) => {
	if (shape.changedDirectionPoints.length > 0) {
		if (shape.direction === "horizontal") {
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

const getLastChangedStartPoint = (shape: DraftShape) => {
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

const getCurrentStartPointForDirectionChange = (shape: DraftShape) => {
	if (shape.changedDirectionPoints.length > 0) {
		const lastChangedDirectionPoint =
			shape.changedDirectionPoints[shape.changedDirectionPoints.length - 2];
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

const getDraftShapeDirectionChangedPoints = (shape: DraftShape) => {
	// for each point return two points with default height on x or y based on index, if index is even then drawinf is horizontal, if index is odd then drawing is vertical
	return shape.changedDirectionPoints.map((point, index) => {
		return [
			{
				id: `draft${point.xPos}-${point.yPos}`,
				xPos: point.xPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2,
				yPos:
					getCurrentStartPointForDirectionChange(shape).yPos +
					SHAPE_DRAWING_DEFAULT_HEIGHT / 2,
			},
			{
				id: `draft${point.xPos}-${point.yPos}-2`,
				xPos: point.xPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2,
				yPos:
					getCurrentStartPointForDirectionChange(shape).yPos -
					SHAPE_DRAWING_DEFAULT_HEIGHT / 2,
			},
		];
	});
};

const getFixingPointsUp = (
	shape: DraftShape,
	currentX: number,
	currentY: number,
) => {
	return shape.changedDirectionPoints.map((point, index) => {
		const moveDirection: "up" | "down" =
			currentY < point.yPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2 ? "up" : "down";
		if (moveDirection === "up") {
			return [
				{
					id: `Fixing point ${index}`,
					xPos: point.xPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2,
					yPos:
						getCurrentStartPointForDirectionChange(shape).yPos -
						SHAPE_DRAWING_DEFAULT_HEIGHT / 2,
				},
			];
		}
	});
};

const getFixingPointsDown = (
	shape: DraftShape,
	currentX: number,
	currentY: number,
) => {
	return shape.changedDirectionPoints.map((point, index) => {
		const moveDirection: "up" | "down" =
			currentY < point.yPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2 ? "up" : "down";
		if (moveDirection === "down") {
			return [
				{
					id: `Fixing point ${index}`,
					xPos: point.xPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2,
					yPos:
						getCurrentStartPointForDirectionChange(shape).yPos +
						SHAPE_DRAWING_DEFAULT_HEIGHT / 2,
				},
			];
		}
	});
};

const getPointDirection = (
	currentPoint: { xPos: number; yPos: number },
	nextPoint: { xPos: number; yPos: number },
	index: number,
): "up" | "down" | "left" | "right" | null => {
	if (!currentPoint || !nextPoint) return null;
	if (index % 2 === 0) {
		return currentPoint.xPos > nextPoint.xPos ? "left" : "right";
	}
	return currentPoint.yPos > nextPoint.yPos ? "up" : "down";
};

const getOuterXPos = (
	currentPoint: { xPos: number; yPos: number },
	nextPoint: { xPos: number; yPos: number },
	previousPoint: { xPos: number; yPos: number },
	index: number,
) => {
	const nextDirection = getPointDirection(currentPoint, nextPoint, index + 1);
	const previousDirection = getPointDirection(
		previousPoint,
		currentPoint,
		index,
	);
	console.log(nextDirection, previousDirection, index);
	// return index % 2 === 0
	// 	? point.xPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2
	// 	: point.xPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	if (previousDirection === "right") {
		if (nextDirection === "up") {
			return currentPoint.xPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
		}
		return currentPoint.xPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	}

	if (previousDirection === "left") {
		if (nextDirection === "up") {
			return currentPoint.xPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
		}
		return currentPoint.xPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	}

	if (previousDirection === "down") {
		if (nextDirection === "right") {
			return currentPoint.xPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
		}
		return currentPoint.xPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	}

	return currentPoint.xPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
};

const getOuterYPos = (
	currentPoint: { xPos: number; yPos: number },
	nextPoint: { xPos: number; yPos: number },
	previousPoint: { xPos: number; yPos: number },
	index: number,
) => {
	const nextDirection = getPointDirection(currentPoint, nextPoint, index + 1);
	const previousDirection = getPointDirection(
		previousPoint,
		currentPoint,
		index,
	);
	// return index % 2 === 0
	// 	? point.yPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2
	// 	: point.yPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	if (previousDirection === "right") {
		if (nextDirection === "up") {
			return currentPoint.yPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
		}
		return currentPoint.yPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	}

	if (previousDirection === "left") {
		if (nextDirection === "up") {
			return currentPoint.yPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
		}
		return currentPoint.yPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	}

	if (previousDirection === "down") {
		if (nextDirection === "right") {
			return currentPoint.yPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
		}
		return currentPoint.yPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	}

	if (previousDirection === "up") {
		if (nextDirection === "right") {
			return currentPoint.yPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
		}
		return currentPoint.yPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	}
	return currentPoint.yPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
};

const getInnerXPos = (
	currentPoint: { xPos: number; yPos: number },
	nextPoint: { xPos: number; yPos: number },
	previousPoint: { xPos: number; yPos: number },
	index: number,
) => {
	const nextDirection = getPointDirection(currentPoint, nextPoint, index + 1);
	const previousDirection = getPointDirection(
		previousPoint,
		currentPoint,
		index,
	);
	console.log(nextDirection, previousDirection, index);
	// return index % 2 === 0
	// 	? point.xPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2
	// 	: point.xPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	if (previousDirection === "right") {
		if (nextDirection === "up") {
			return currentPoint.xPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
		}
		return currentPoint.xPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	}

	if (previousDirection === "left") {
		if (nextDirection === "up") {
			return currentPoint.xPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
		}
		return currentPoint.xPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	}

	if (previousDirection === "down") {
		if (nextDirection === "right") {
			return currentPoint.xPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
		}
		return currentPoint.xPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	}

	return currentPoint.xPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
};

const getInnerYPos = (
	currentPoint: { xPos: number; yPos: number },
	nextPoint: { xPos: number; yPos: number },
	previousPoint: { xPos: number; yPos: number },
	index: number,
) => {
	const nextDirection = getPointDirection(currentPoint, nextPoint, index + 1);
	const previousDirection = getPointDirection(
		previousPoint,
		currentPoint,
		index,
	);
	// return index % 2 === 0
	// 	? point.yPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2
	// 	: point.yPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	if (previousDirection === "right") {
		if (nextDirection === "up") {
			return currentPoint.yPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
		}
		return currentPoint.yPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	}

	if (previousDirection === "left") {
		if (nextDirection === "up") {
			return currentPoint.yPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
		}
		return currentPoint.yPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	}

	if (previousDirection === "down") {
		if (nextDirection === "right") {
			return currentPoint.yPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
		}
		return currentPoint.yPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	}

	if (previousDirection === "up") {
		if (nextDirection === "right") {
			return currentPoint.yPos - SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
		}
		return currentPoint.yPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
	}
	return currentPoint.yPos + SHAPE_DRAWING_DEFAULT_HEIGHT / 2;
};

const getOuterPoints = (
	currentPoint: { xPos: number; yPos: number },
	nextPoint: { xPos: number; yPos: number },
	previousPoint: { xPos: number; yPos: number },
	index: number,
) => {
	return {
		xPos: getOuterXPos(currentPoint, nextPoint, previousPoint, index),
		yPos: getOuterYPos(currentPoint, nextPoint, previousPoint, index),
	};
};

const getInnerPoints = (
	currentPoint: { xPos: number; yPos: number },
	nextPoint: { xPos: number; yPos: number },
	previousPoint: { xPos: number; yPos: number },
	index: number,
) => {
	return {
		xPos: getInnerXPos(currentPoint, nextPoint, previousPoint, index),
		yPos: getInnerYPos(currentPoint, nextPoint, previousPoint, index),
	};
};

export function useShapeDrawing(
	shapes: ReadonlyArray<CanvasShape>,
	zoom: number,
	canvasPosition: { x: number; y: number },
	onComplete?: (shape: {
		xPos: number;
		yPos: number;
		points: Array<{ xPos: number; yPos: number }>;
	}) => void,
) {
	const [draftShape, setDraftShape] = useState<DraftShape | null>(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [canChangeDirectionNow, setCanChangeDirectionNow] = useState(false);
	const [actualyChangingDirectionNow, setActualyChangingDirectionNow] =
		useState(false);

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
		setDraftShape({
			startX: canvasPoint.x,
			startY: canvasPoint.y,
			currentX: canvasPoint.x,
			currentY: canvasPoint.y,
			changedDirectionPoints: [],
			direction: "horizontal",
		});
	};

	const handleDrawMove = (e: KonvaEventObject<MouseEvent>) => {
		const stage = e.target.getStage();
		if (!stage) return;

		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		const canvasPoint = screenToCanvas(pointer.x, pointer.y);

		if (!draftShape) return;

		const canChangeDirectionNowValue = canChangeDirection(
			{
				xPos: getLastChangedStartPoint(draftShape).xPos,
				yPos: getLastChangedStartPoint(draftShape).yPos,
			},
			{ xPos: canvasPoint.x, yPos: canvasPoint.y },
			draftShape.direction,
		);
		setCanChangeDirectionNow(canChangeDirectionNowValue);

		const actualyChangingDirectionNowValue = actualyChangingDirection(
			canChangeDirectionNowValue,
			draftShape.direction,
			canvasPoint.x,
			canvasPoint.y,
			getLastChangedStartPoint(draftShape).xPos,
			getLastChangedStartPoint(draftShape).yPos,
		);
		setActualyChangingDirectionNow(actualyChangingDirectionNowValue);

		if (actualyChangingDirectionNowValue) {
			const xPos =
				draftShape.direction === "horizontal"
					? canvasPoint.x
					: getLastChangedStartPoint(draftShape).xPos;
			const yPos =
				draftShape.direction === "vertical"
					? canvasPoint.y
					: getLastChangedStartPoint(draftShape).yPos;
			setDraftShape({
				...draftShape,
				changedDirectionPoints: [
					...draftShape.changedDirectionPoints,
					{ xPos, yPos },
				],
				direction:
					draftShape.direction === "horizontal" ? "vertical" : "horizontal",
			});
		} else if (
			returnedFromChangedDirection(draftShape, canvasPoint.x, canvasPoint.y)
		) {
			setDraftShape({
				...draftShape,
				direction:
					draftShape.direction === "horizontal" ? "vertical" : "horizontal",
				changedDirectionPoints: draftShape.changedDirectionPoints.slice(0, -1),
			});
		} else {
			setDraftShape({
				...draftShape,
				currentX:
					draftShape.direction === "horizontal"
						? canvasPoint.x
						: getLastChangedStartPoint(draftShape).xPos,
				currentY:
					draftShape.direction === "vertical"
						? canvasPoint.y
						: getLastChangedStartPoint(draftShape).yPos,
			});
		}
	};

	const handleDrawEnd = () => {
		// If we have a valid draft shape, call onComplete before clearing
		if (draftShape && onComplete) {
			const draftBounds = getDraftBounds();
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

		setDraftShape(null);
		setIsDrawing(false);
		setCanChangeDirectionNow(false);
		setActualyChangingDirectionNow(false);
	};

	const getCursor = (e: KonvaEventObject<MouseEvent>): string => {
		if (isDrawing) return "crosshair";
		return "default";
	};

	const getLastDirection = (): "up" | "down" | "left" | "right" | null => {
		if (!draftShape) return null;

		if (draftShape.direction === "horizontal") {
			return draftShape.currentX > getLastChangedStartPoint(draftShape).xPos
				? "right"
				: "left";
		}
		return draftShape.currentY > getLastChangedStartPoint(draftShape).yPos
			? "down"
			: "up";
	};

	const getDraftBounds = (): Array<Point> | null => {
		if (!draftShape) return null;

		const lastDirection = getLastDirection();

		const isFirstShape = draftShape.changedDirectionPoints.length === 0;

		const horizontalPoints = [
			{
				id: "draft3",
				xPos: draftShape.currentX,
				yPos:
					draftShape.currentY +
					(lastDirection === "left"
						? -SHAPE_DRAWING_DEFAULT_HEIGHT / 2
						: SHAPE_DRAWING_DEFAULT_HEIGHT / 2),
			},
			{
				id: "draft4",
				xPos: draftShape.currentX,
				yPos:
					draftShape.currentY -
					(lastDirection === "left"
						? -SHAPE_DRAWING_DEFAULT_HEIGHT / 2
						: SHAPE_DRAWING_DEFAULT_HEIGHT / 2),
			},
		];

		const verticalPoints = [
			{
				id: "draft3",
				xPos:
					draftShape.currentX +
					(lastDirection === "down"
						? -SHAPE_DRAWING_DEFAULT_HEIGHT / 2
						: SHAPE_DRAWING_DEFAULT_HEIGHT / 2),
				yPos: draftShape.currentY,
			},
			{
				id: "draft4",
				xPos:
					draftShape.currentX -
					(lastDirection === "down"
						? -SHAPE_DRAWING_DEFAULT_HEIGHT / 2
						: SHAPE_DRAWING_DEFAULT_HEIGHT / 2),
				yPos: draftShape.currentY,
			},
		];

		const calculateAllPoints = (draftShape: DraftShape) => {
			// connect each point and on each connect change direction from horizontal to vertical and vice versa. In end use current position and start connecting again backwards
			const outerPoints = draftShape.changedDirectionPoints.map(
				(point, index) => {
					const outerPoint = getOuterPoints(
						point,
						draftShape.changedDirectionPoints[index + 1] || {
							xPos: draftShape.currentX,
							yPos: draftShape.currentY,
						},
						draftShape.changedDirectionPoints[index - 1] || {
							xPos: draftShape.startX,
							yPos: draftShape.startY,
						},
						index,
					);
					return {
						id: `draft${point.xPos}-${point.yPos}`,
						xPos: outerPoint.xPos,
						yPos: outerPoint.yPos,
					};
				},
			);

			const innerPoints = draftShape.changedDirectionPoints.map(
				(point, index) => {
					const innerPoint = getInnerPoints(
						point,
						draftShape.changedDirectionPoints[index + 1] || {
							xPos: draftShape.currentX,
							yPos: draftShape.currentY,
						},
						draftShape.changedDirectionPoints[index - 1] || {
							xPos: draftShape.startX,
							yPos: draftShape.startY,
						},
						index,
					);
					return {
						id: `draft${point.xPos}-${point.yPos}`,
						xPos: innerPoint.xPos,
						yPos: innerPoint.yPos,
					};
				},
			);

			const currentPoints =
				draftShape.direction === "horizontal"
					? horizontalPoints
					: verticalPoints;
			return [...outerPoints, ...currentPoints, ...innerPoints.reverse()];
		};

		const testPoints = [
			{
				id: "draft",
				xPos: draftShape.startX,
				yPos: draftShape.startY - SHAPE_DRAWING_DEFAULT_HEIGHT / 2,
			},
			{
				id: "draft2",
				xPos: draftShape.startX,
				yPos: draftShape.startY + SHAPE_DRAWING_DEFAULT_HEIGHT / 2,
			},
			...calculateAllPoints(draftShape),

			// const testPoints = [
			// 	{
			// 		id: "draft",
			// 		xPos: draftShape.startX,
			// 		yPos: draftShape.startY - SHAPE_DRAWING_DEFAULT_HEIGHT / 2,
			// 	},
			// 	{
			// 		id: "draft2",
			// 		xPos: draftShape.startX,
			// 		yPos: draftShape.startY + SHAPE_DRAWING_DEFAULT_HEIGHT / 2,
			// 	},
			// 	...getDraftShapeDirectionChangedPoints(draftShape).flat(),
			// 	...(draftShape.direction === "horizontal"
			// 		? horizontalPoints
			// 		: verticalPoints),
			// 	...getFixingPointsUp(
			// 		draftShape,
			// 		draftShape.currentX,
			// 		draftShape.currentY,
			// 	).flat(),
			// ].filter((point) => point !== undefined);
		].filter((point) => point !== undefined);

		return testPoints;
	};

	return {
		handleDrawStart,
		handleDrawMove,
		handleDrawEnd,
		isDrawing,
		getCursor,
		getDraftBounds,
		draftShape,
		canChangeDirectionNow,
		actualyChangingDirectionNow,
		lastDirection: getLastDirection(),
	};
}
