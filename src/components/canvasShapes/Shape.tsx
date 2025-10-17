import type { KonvaEventObject } from "konva/lib/Node";
import type { Context } from "konva/lib/Context";
import { useEffect, useMemo, useRef, useState } from "react";
import { Line, Group, Circle } from "react-konva";
import type { CanvasShape, Coordinate } from "~/types/drawing";
import {
	SHAPE_DEFAULT_COLOR,
	SHAPE_DEFAULT_FILL_COLOR,
	SHAPE_HOVERED_COLOR,
	SHAPE_HOVERED_FILL_COLOR,
	SHAPE_SELECTED_COLOR,
	SHAPE_SELECTED_FILL_COLOR,
} from "~/utils/canvas-constants";
import ShapeEdgeMeasurements from "./ShapeEdgeMeasurements";
import { DrawingTab } from "~/components/header/header/drawing-types";

// Constants for interactive elements
const EDGE_STROKE_WIDTH = 2;
const EDGE_STROKE_WIDTH_HOVERED = 4;
const EDGE_HIT_STROKE_WIDTH = 12;
const POINT_HOVER_RADIUS = 20;
const POINT_HOVER_OPACITY = 0.8;

interface ShapeProps {
	shape: CanvasShape;
	isSelected: boolean;
	isHovered: boolean;
	isDrawing: boolean;
	isDraggable: boolean;
	onClick: (e: KonvaEventObject<MouseEvent>) => void;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
	onDragEnd: (newX: number, newY: number) => void;
	onContextMenu: (e: KonvaEventObject<PointerEvent>) => void;
	activeTab?: number;
}

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
 * Calculate distance between two points
 */
const calculateDistance = (p1: Coordinate, p2: Coordinate): number => {
	const dx = p2.xPos - p1.xPos;
	const dy = p2.yPos - p1.yPos;
	return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Create clipping function for a polygon shape
 */
const createShapeClipFunc =
	(points: readonly Coordinate[]) => (ctx: Context) => {
		ctx.beginPath();
		for (let i = 0; i < points.length; i++) {
			const p = points[i];
			if (!p) continue;
			if (i === 0) {
				ctx.moveTo(p.xPos, p.yPos);
			} else {
				ctx.lineTo(p.xPos, p.yPos);
			}
		}
		ctx.closePath();
	};

/**
 * Get stroke color based on shape state
 */
const getStrokeColor = (isSelected: boolean, isHovered: boolean): string => {
	if (isSelected) return SHAPE_SELECTED_COLOR;
	if (isHovered) return SHAPE_HOVERED_COLOR;
	return SHAPE_DEFAULT_COLOR;
};

/**
 * Get fill color based on shape state
 */
const getFillColor = (isSelected: boolean, isHovered: boolean): string => {
	if (isSelected) return SHAPE_SELECTED_FILL_COLOR;
	if (isHovered) return SHAPE_HOVERED_FILL_COLOR;
	return SHAPE_DEFAULT_FILL_COLOR;
};

const Shape = ({
	shape,
	isSelected,
	isHovered,
	isDrawing,
	isDraggable,
	onClick,
	onMouseEnter,
	onMouseLeave,
	onDragEnd,
	onContextMenu,
	activeTab,
}: ShapeProps) => {
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [hoveredEdgeIndex, setHoveredEdgeIndex] = useState<number | null>(null);
	const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(
		null,
	);
	const prevShapePos = useRef({ x: shape.xPos, y: shape.yPos });

	// Reset drag offset when shape position changes (after optimistic update)
	useEffect(() => {
		const positionChanged =
			prevShapePos.current.x !== shape.xPos ||
			prevShapePos.current.y !== shape.yPos;

		if (positionChanged) {
			setDragOffset({ x: 0, y: 0 });
			prevShapePos.current = { x: shape.xPos, y: shape.yPos };
		}
	}, [shape.xPos, shape.yPos]);

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

	// Determine rendering mode based on active tab
	const isEdgesMode =
		activeTab === DrawingTab.Edges || activeTab === DrawingTab.Shape;
	const isShapeMode = activeTab === DrawingTab.Shape;

	const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
		const node = e.target;
		const offsetX = node.x() - (shape.xPos + centerX);
		const offsetY = node.y() - (shape.yPos + centerY);
		setDragOffset({ x: offsetX, y: offsetY });
	};

	const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
		const node = e.target;
		const newX = node.x() - centerX;
		const newY = node.y() - centerY;
		onDragEnd(newX, newY);
	};

	const handleEdgeClick = (
		edgeIndex: number,
		e: KonvaEventObject<MouseEvent>,
	) => {
		if (isDrawing || e.evt.button !== 0) return;

		const startPoint = absolutePoints[edgeIndex];
		const endPoint = absolutePoints[(edgeIndex + 1) % absolutePoints.length];

		if (!startPoint || !endPoint) return;

		const length = calculateDistance(startPoint, endPoint);

		console.log("Edge Info:", {
			shapeId: shape.id,
			edgeIndex,
			startPoint: {
				x: startPoint.xPos.toFixed(2),
				y: startPoint.yPos.toFixed(2),
			},
			endPoint: {
				x: endPoint.xPos.toFixed(2),
				y: endPoint.yPos.toFixed(2),
			},
			length: length.toFixed(2),
		});

		onClick(e);
	};

	const handlePointClick = (
		pointIndex: number,
		e: KonvaEventObject<MouseEvent>,
	) => {
		e.cancelBubble = true;
		if (isDrawing || e.evt.button !== 0) return;

		const point = absolutePoints[pointIndex];
		if (!point) return;

		const prevIndex =
			(pointIndex - 1 + absolutePoints.length) % absolutePoints.length;
		const nextIndex = (pointIndex + 1) % absolutePoints.length;
		const prevPoint = absolutePoints[prevIndex];
		const nextPoint = absolutePoints[nextIndex];

		const adjacentEdges: { edge1Length?: string; edge2Length?: string } = {};

		if (prevPoint) {
			adjacentEdges.edge1Length = calculateDistance(prevPoint, point).toFixed(
				2,
			);
		}
		if (nextPoint) {
			adjacentEdges.edge2Length = calculateDistance(point, nextPoint).toFixed(
				2,
			);
		}

		console.log("Point Info:", {
			shapeId: shape.id,
			pointIndex,
			position: {
				x: point.xPos.toFixed(2),
				y: point.yPos.toFixed(2),
			},
			adjacentEdgeLengths: adjacentEdges,
		});

		onClick(e);
	};

	const handleEdgeMouseEnter = (index: number) => {
		if (!isDrawing) {
			setHoveredEdgeIndex(index);
			onMouseEnter();
		}
	};

	const handleEdgeMouseLeave = () => {
		setHoveredEdgeIndex(null);
		onMouseLeave();
	};

	const handlePointMouseEnter = (index: number) => {
		if (!isDrawing) {
			setHoveredPointIndex(index);
		}
	};

	const handlePointMouseLeave = () => {
		setHoveredPointIndex(null);
	};

	// Render mode: Edges and Shape tabs (individual edge/point interaction)
	if (isEdgesMode) {
		return (
			<>
				<Group
					x={shape.xPos + centerX}
					y={shape.yPos + centerY}
					offsetX={centerX}
					offsetY={centerY}
					rotation={shape.rotation}
					draggable={isDraggable && !isDrawing}
					listening={!isDrawing}
					onDragMove={handleDragMove}
					onDragEnd={handleDragEnd}
					onContextMenu={onContextMenu}
					clipFunc={createShapeClipFunc(shape.points)}
				>
					{/* Draggable background fill - handles drag interactions */}
					<Line
						points={flattenedPoints}
						fill={getFillColor(isSelected, isHovered)}
						closed
						listening={!isDrawing}
						draggable={false}
						onClick={onClick}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
					/>

					{/* Individual edges */}
					{shape.points.map((point, index) => {
						const nextIndex = (index + 1) % shape.points.length;
						const nextPoint = shape.points[nextIndex];
						if (!nextPoint) return null;

						const isEdgeHovered = hoveredEdgeIndex === index;

						return (
							<Line
								key={`${shape.id}-edge-${index}`}
								points={[point.xPos, point.yPos, nextPoint.xPos, nextPoint.yPos]}
								stroke={
									isEdgeHovered
										? SHAPE_HOVERED_COLOR
										: getStrokeColor(isSelected, false)
								}
								strokeWidth={
									isEdgeHovered ? EDGE_STROKE_WIDTH_HOVERED : EDGE_STROKE_WIDTH
								}
								hitStrokeWidth={EDGE_HIT_STROKE_WIDTH}
								listening={!isDrawing}
								onClick={(e) => handleEdgeClick(index, e)}
								onMouseEnter={() => handleEdgeMouseEnter(index)}
								onMouseLeave={handleEdgeMouseLeave}
							/>
						);
					})}

					{/* Individual points (Shape mode only) */}
					{isShapeMode &&
						shape.points.map((point, index) => {
							const isPointHovered = hoveredPointIndex === index;

							return (
								<Circle
									key={`${shape.id}-point-${index}`}
									x={point.xPos}
									y={point.yPos}
									radius={POINT_HOVER_RADIUS}
									fill={isPointHovered ? "red" : "transparent"}
									opacity={isPointHovered ? POINT_HOVER_OPACITY : 1}
									stroke="transparent"
									listening={!isDrawing}
									onClick={(e) => handlePointClick(index, e)}
									onMouseEnter={() => handlePointMouseEnter(index)}
									onMouseLeave={handlePointMouseLeave}
								/>
							);
						})}
				</Group>

				{/* Edge measurements - outside of clipped group */}
				<ShapeEdgeMeasurements points={absolutePoints} />
			</>
		);
	}

	// Render mode: Default (simple closed polygon)
	return (
		<>
			<Line
				x={shape.xPos + centerX}
				y={shape.yPos + centerY}
				offsetX={centerX}
				offsetY={centerY}
				rotation={shape.rotation}
				points={flattenedPoints}
				stroke={getStrokeColor(isSelected, isHovered)}
				fill={getFillColor(isSelected, isHovered)}
				strokeWidth={EDGE_STROKE_WIDTH}
				closed
				listening={!isDrawing}
				draggable={isDraggable && !isDrawing}
				onClick={(e) => {
					if (!isDrawing && e.evt.button === 0) {
						onClick(e);
					}
				}}
				onMouseEnter={() => !isDrawing && onMouseEnter()}
				onMouseLeave={onMouseLeave}
				onContextMenu={onContextMenu}
				onDragMove={handleDragMove}
				onDragEnd={handleDragEnd}
			/>
			<ShapeEdgeMeasurements points={absolutePoints} />
		</>
	);
};

export default Shape;
