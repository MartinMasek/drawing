import type { KonvaEventObject } from "konva/lib/Node";
import type { Context } from "konva/lib/Context";
import { useEffect, useMemo, useRef, useState } from "react";
import { Line, Group, Circle } from "react-konva";
import type { CanvasShape, Coordinate } from "~/types/drawing";
import {
	SHAPE_DEFAULT_STROKE_COLOR,
	SHAPE_DEFAULT_FILL_COLOR,
	SHAPE_HOVERED_STROKE_COLOR,
	SHAPE_HOVERED_FILL_COLOR,
	SHAPE_SELECTED_STROKE_COLOR,
	SHAPE_SELECTED_FILL_COLOR,
} from "~/utils/canvas-constants";
import ShapeEdgeMeasurements from "./ShapeEdgeMeasurements";
import {
	CursorTypes,
	DrawingTab,
} from "~/components/header/header/drawing-types";
import { useDrawing } from "../header/context/DrawingContext";
import { useShape } from "../header/context/ShapeContext";
import { CornerType, EdgeModificationType, EdgeShapePosition } from "@prisma/client";

// Constants for interactive elements
const EDGE_STROKE_WIDTH = 2;
const EDGE_STROKE_WIDTH_HOVERED = 4;
const EDGE_STROKE_WIDTH_SELECTED = 6;
const EDGE_HIT_STROKE_WIDTH = 16;
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
	onDragStart?: () => void;
	onDragMove?: (newX: number, newY: number) => void;
	onDragEnd: (newX: number, newY: number) => void;
	onContextMenu: (e: KonvaEventObject<PointerEvent>) => void;
	activeTab?: number;
	isDebugMode: boolean;
	scale: number;
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
	if (isSelected) return SHAPE_SELECTED_STROKE_COLOR;
	if (isHovered) return SHAPE_HOVERED_STROKE_COLOR;
	return SHAPE_DEFAULT_STROKE_COLOR;
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
	onDragStart: onDragStartCallback,
	onDragMove: onDragMoveCallback,
	onDragEnd,
	onContextMenu,
	activeTab,
	isDebugMode,
	scale,
}: ShapeProps) => {
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [hoveredEdgeIndex, setHoveredEdgeIndex] = useState<number | null>(null);
	const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(
		null,
	);
	const [isDragging, setIsDragging] = useState(false);
	const prevShapePos = useRef({ x: shape.xPos, y: shape.yPos });
	const { cursorType, setCursorType } = useDrawing();
	const { selectedEdge, selectedCorner, setSelectedEdge, setSelectedCorner } =
		useShape();

	// Reset drag offset when shape position changes (after optimistic update)
	// But only if we're not currently dragging (to prevent snap-back during drag)
	useEffect(() => {
		const positionChanged =
			prevShapePos.current.x !== shape.xPos ||
			prevShapePos.current.y !== shape.yPos;

		if (positionChanged && !isDragging) {
			setDragOffset({ x: 0, y: 0 });
			prevShapePos.current = { x: shape.xPos, y: shape.yPos };
		} else if (positionChanged && isDragging) {
			// Position changed while dragging (e.g., temp ID replaced with real ID)
			// Update the reference but keep the dragOffset to maintain visual position
			prevShapePos.current = { x: shape.xPos, y: shape.yPos };
		}
	}, [shape.xPos, shape.yPos, isDragging]);

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

	const handleDragStart = () => {
		setIsDragging(true);
		onDragStartCallback?.();
	};

	const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
		const node = e.target;
		const offsetX = node.x() - (shape.xPos + centerX);
		const offsetY = node.y() - (shape.yPos + centerY);
		setDragOffset({ x: offsetX, y: offsetY });

		// Notify parent of drag position (for temp ID cache updates)
		if (onDragMoveCallback) {
			const newX = node.x() - centerX;
			const newY = node.y() - centerY;
			onDragMoveCallback(newX, newY);
		}
	};

	const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
		const node = e.target;
		const newX = node.x() - centerX;
		const newY = node.y() - centerY;
		setIsDragging(false);
		onDragEnd(newX, newY);
	};

	const handleEdgeClick = (
		edgeIndex: number,
		point1Id: string,
		point2Id: string,
		e: KonvaEventObject<MouseEvent>,
	) => {
		if (isDrawing || e.evt.button !== 0) return;

		const startPoint = absolutePoints[edgeIndex];
		const endPoint = absolutePoints[(edgeIndex + 1) % absolutePoints.length];

		if (!startPoint || !endPoint) return;

		const doesEdgeExist = shape.edges.find((edge) => edge.point1Id === point1Id && edge.point2Id === point2Id);

		const hasModification = doesEdgeExist?.edgeModifications.length && doesEdgeExist?.edgeModifications.length > 0;
		const modification = hasModification ? doesEdgeExist?.edgeModifications[0] : null;

		setCursorType(CursorTypes.Curves);

		setSelectedEdge({
			shapeId: shape.id,
			edgeIndex,
			edgeId: doesEdgeExist?.id ?? null,
			edgePoint1Id: point1Id,
			edgePoint2Id: point2Id,
			edgeModification: {
				id: modification?.id ?? null,
				type: modification?.type ?? EdgeModificationType.None,
				position: modification?.position ?? EdgeShapePosition.Center,
				distance: modification?.distance ?? 0,
				depth: modification?.depth ?? 0,
				width: modification?.width ?? 0,
				sideAngleLeft: modification?.sideAngleLeft ?? 0,
				sideAngleRight: modification?.sideAngleRight ?? 0,
				fullRadiusDepth: modification?.fullRadiusDepth ?? 0,
			},
		});
		setSelectedCorner(null);
		onClick(e);
	};

	const handlePointClick = (
		pointIndex: number,
		pointId: string,
		e: KonvaEventObject<MouseEvent>,
	) => {
		e.cancelBubble = true;
		if (isDrawing || e.evt.button !== 0) return;

		const point = absolutePoints[pointIndex];
		if (!point) return;

		const doesCornerExist = shape.corners.find((corner) => corner.pointId === pointId);

		setCursorType(CursorTypes.Corners);

		setSelectedCorner({
			shapeId: shape.id,
			pointIndex,
			pointId,
			cornerId: doesCornerExist?.id ?? null,
			type: doesCornerExist?.type ?? CornerType.None,
			clip: doesCornerExist?.clip ?? undefined,
			radius: doesCornerExist?.radius ?? undefined,
			modificationLength: doesCornerExist?.modificationLength ?? undefined,
			modificationDepth: doesCornerExist?.modificationDepth ?? undefined
		});
		setSelectedEdge(null);
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
			onMouseEnter();
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
					onDragStart={handleDragStart}
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
						const isEdgeSelected = selectedEdge?.edgeIndex === index &&
							selectedEdge?.shapeId === shape.id;

						return (
							<Line
								key={`${shape.id}-edge-${index}`}
								points={[
									point.xPos,
									point.yPos,
									nextPoint.xPos,
									nextPoint.yPos,
								]}
								stroke={
									isEdgeHovered
										? SHAPE_HOVERED_STROKE_COLOR
										: getStrokeColor(isSelected, false)
								}
								strokeWidth={
									isEdgeSelected
										? EDGE_STROKE_WIDTH_SELECTED
										: isEdgeHovered
											? EDGE_STROKE_WIDTH_HOVERED
											: EDGE_STROKE_WIDTH
								}
								hitStrokeWidth={EDGE_HIT_STROKE_WIDTH}
								listening={!isDrawing}
								onClick={(e) => handleEdgeClick(index, point.id, nextPoint.id, e)}
								onMouseEnter={() => handleEdgeMouseEnter(index)}
								onMouseLeave={handleEdgeMouseLeave}
							/>
						);
					})}

					{/* Individual points (Shape mode only) */}
					{isShapeMode &&
						shape.points.map((point, index) => {
							const isPointHovered = hoveredPointIndex === index;
							const isPointSelected =
								selectedCorner?.pointIndex === index &&
								selectedCorner?.shapeId === shape.id;
							return (
								<Circle
									key={`${shape.id}-point-${index}`}
									x={point.xPos}
									y={point.yPos}
									radius={POINT_HOVER_RADIUS}
									fill={
										isPointSelected ? SHAPE_SELECTED_STROKE_COLOR : (isPointHovered ? SHAPE_HOVERED_STROKE_COLOR : "transparent")
									}
									opacity={isPointHovered ? POINT_HOVER_OPACITY : 1}
									stroke="transparent"
									listening={!isDrawing}
									onClick={(e) => handlePointClick(index, point.id, e)}
									onMouseEnter={() => handlePointMouseEnter(index)}
									onMouseLeave={handlePointMouseLeave}
								/>
							);
						})}
				</Group>

				{/* Edge measurements - outside of clipped group */}
				<ShapeEdgeMeasurements points={absolutePoints} scale={scale} />
			</>
		);
	}

	// Render mode: Default (simple closed polygon)
	return (
		<>
			{isDebugMode && (
				<ShapeDebugLayer
					shape={shape}
					centerX={centerX}
					centerY={centerY}
					dragOffset={dragOffset}
				/>
			)}
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
				onDragStart={handleDragStart}
			/>

			<ShapeEdgeMeasurements points={absolutePoints} scale={scale} />
		</>
	);
};

export default Shape;

const ShapeDebugLayer = ({
	shape,
	centerX,
	centerY,
	dragOffset,
}: {
	shape: CanvasShape;
	centerX: number;
	centerY: number;
	dragOffset: { x: number; y: number };
}) => {
	if (!shape.edgeIndices) return null;

	return (
		<Group
			x={shape.xPos + centerX + dragOffset.x}
			y={shape.yPos + centerY + dragOffset.y}
			offsetX={centerX}
			offsetY={centerY}
			rotation={shape.rotation}
			listening={false}
		>
			<Line
				points={[
					shape.points[shape.edgeIndices.startPoint1]?.xPos ?? 0,
					shape.points[shape.edgeIndices.startPoint1]?.yPos ?? 0,
					shape.points[shape.edgeIndices.startPoint2]?.xPos ?? 0,
					shape.points[shape.edgeIndices.startPoint2]?.yPos ?? 0,
				]}
				stroke="red"
				strokeWidth={6}
				listening={false}
			/>
			<Line
				points={[
					shape.points[shape.edgeIndices.endPoint1]?.xPos ?? 0,
					shape.points[shape.edgeIndices.endPoint1]?.yPos ?? 0,
					shape.points[shape.edgeIndices.endPoint2]?.xPos ?? 0,
					shape.points[shape.edgeIndices.endPoint2]?.yPos ?? 0,
				]}
				stroke="red"
				strokeWidth={6}
				listening={false}
			/>
		</Group>
	);
};
