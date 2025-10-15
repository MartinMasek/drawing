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
	onClick: () => void;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
}

const Shape = ({
	shape,
	isSelected,
	isHovered,
	isDrawing,
	onClick,
	onMouseEnter,
	onMouseLeave,
}: ShapeProps) => {
	// Convert shape points to flattened array for Line component
	const flattenedPoints: number[] = [];
	const absolutePoints: Coordinate[] = [];

	for (const p of shape.points) {
		// Add shape origin to each point. Rotation is ignored for now.
		const absX = p.xPos + shape.xPos;
		const absY = p.yPos + shape.yPos;
		flattenedPoints.push(absX, absY);
		absolutePoints.push({ xPos: absX, yPos: absY });
	}

	return (
		<>
			<Line
				key={shape.id}
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
				onClick={() => !isDrawing && onClick()}
				onMouseEnter={() => !isDrawing && onMouseEnter()}
				onMouseLeave={onMouseLeave}
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
