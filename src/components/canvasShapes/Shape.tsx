import type { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useRef, useState } from "react";
import { Line } from "react-konva";
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

interface ShapeProps {
	shape: CanvasShape;
	isSelected: boolean;
	isHovered: boolean;
	isDrawing: boolean;
	isDraggable: boolean;
	onClick: () => void;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
	onDragEnd: (newX: number, newY: number) => void;
	onContextMenu: (e: KonvaEventObject<PointerEvent>) => void;
}

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
}: ShapeProps) => {
	// Track drag offset for live measurement updates during drag
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const prevShapePos = useRef({ x: shape.xPos, y: shape.yPos });

	// Reset drag offset when shape position or rotation changes (after optimistic update)
	useEffect(() => {
		if (
			prevShapePos.current.x !== shape.xPos ||
			prevShapePos.current.y !== shape.yPos
		) {
			// Position changed - reset drag offset
			setDragOffset({ x: 0, y: 0 });
			prevShapePos.current = { x: shape.xPos, y: shape.yPos };
		}
	}, [shape.xPos, shape.yPos]);

	// Calculate bounding box to find center point for rotation
	let minX = Number.POSITIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	let maxX = Number.NEGATIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;

	for (const p of shape.points) {
		minX = Math.min(minX, p.xPos);
		minY = Math.min(minY, p.yPos);
		maxX = Math.max(maxX, p.xPos);
		maxY = Math.max(maxY, p.yPos);
	}

	// Center point of the bounding box (rotation offset)
	const centerX = (minX + maxX) / 2;
	const centerY = (minY + maxY) / 2;

	// Convert shape points to flattened array for Line component
	const flattenedPoints: number[] = [];
	const absolutePoints: Coordinate[] = [];

	// Convert rotation from degrees to radians for calculations
	const rotationRad = (shape.rotation * Math.PI) / 180;
	const cos = Math.cos(rotationRad);
	const sin = Math.sin(rotationRad);

	for (const p of shape.points) {
		// Points are relative to shape origin for rotation to work correctly
		flattenedPoints.push(p.xPos, p.yPos);
		
		// For measurements, calculate absolute position with rotation and drag offset
		// Points need to be relative to center for rotation
		const relX = p.xPos - centerX;
		const relY = p.yPos - centerY;
		
		// Apply rotation transformation
		const rotatedX = relX * cos - relY * sin;
		const rotatedY = relX * sin + relY * cos;
		
		// Then translate to world coordinates with drag offset
		const absX = rotatedX + centerX + shape.xPos + dragOffset.x;
		const absY = rotatedY + centerY + shape.yPos + dragOffset.y;
		
		absolutePoints.push({
			xPos: absX,
			yPos: absY,
		});
	}

	const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
		const node = e.target;
		// Calculate drag offset from original position (center)
		const offsetX = node.x() - (shape.xPos + centerX);
		const offsetY = node.y() - (shape.yPos + centerY);
		setDragOffset({ x: offsetX, y: offsetY });
	};

	const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
		const node = e.target;
		// Convert from center position back to shape position
		const newX = node.x() - centerX;
		const newY = node.y() - centerY;

		// Call the update with new absolute position
		// The optimistic update will trigger re-render with correct position
		onDragEnd(newX, newY);
	};

	return (
		<>
			<Line
				key={shape.id}
				x={shape.xPos + centerX}
				y={shape.yPos + centerY}
				offsetX={centerX}
				offsetY={centerY}
				rotation={shape.rotation}
				points={flattenedPoints}
				stroke={
					isSelected
						? SHAPE_SELECTED_COLOR
						: isHovered
							? SHAPE_HOVERED_COLOR
							: SHAPE_DEFAULT_COLOR
				}
				fill={
					isSelected
						? SHAPE_SELECTED_FILL_COLOR
						: isHovered
							? SHAPE_HOVERED_FILL_COLOR
							: SHAPE_DEFAULT_FILL_COLOR
				}
				strokeWidth={2}
				closed
				listening={!isDrawing}
				draggable={isDraggable && !isDrawing}
				onClick={(e) => {
					// Only handle left clicks (button 0), ignore right clicks (button 2)
					if (!isDrawing && e.evt.button === 0) {
						onClick();
					}
				}}
				onMouseEnter={() => !isDrawing && onMouseEnter()}
				onMouseLeave={onMouseLeave}
				onContextMenu={onContextMenu}
				onDragMove={handleDragMove}
				onDragEnd={handleDragEnd}
			/>
			{/* Edge measurements for the shape */}
			<ShapeEdgeMeasurements
				key={`measurements-${shape.id}`}
				points={absolutePoints}
			/>
		</>
	);
};

export default Shape;
