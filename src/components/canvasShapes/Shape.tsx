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
		// Apply rotation transformation first
		const rotatedX = p.xPos * cos - p.yPos * sin;
		const rotatedY = p.xPos * sin + p.yPos * cos;
		
		// Then translate to world coordinates with drag offset
		const absX = rotatedX + shape.xPos + dragOffset.x;
		const absY = rotatedY + shape.yPos + dragOffset.y;
		
		absolutePoints.push({
			xPos: absX,
			yPos: absY,
		});
	}

	const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
		const node = e.target;
		// Calculate drag offset from original position
		const offsetX = node.x() - shape.xPos;
		const offsetY = node.y() - shape.yPos;
		setDragOffset({ x: offsetX, y: offsetY });
	};

	const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
		const node = e.target;
		const newX = node.x();
		const newY = node.y();

		// Call the update with new absolute position
		// The optimistic update will trigger re-render with correct position
		onDragEnd(newX, newY);
	};

	return (
		<>
			<Line
				key={shape.id}
				x={shape.xPos}
				y={shape.yPos}
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
