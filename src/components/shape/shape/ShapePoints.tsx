import { memo } from "react";
import { Circle } from "react-konva";
import type { CanvasShape } from "~/types/drawing";
import type { KonvaEventObject } from "konva/lib/Node";
import { getStrokeColor } from "~/utils/canvas-constants";

const POINT_HOVER_RADIUS = 20;
const POINT_HOVER_OPACITY = 0.8;

interface ShapePointsProps {
	shape: CanvasShape;
	hoveredPointIndex: number | null;
	selectedPointIndex: number | null;
	isDrawing: boolean;
	handlePointClick: (
		pointIndex: number,
		pointId: string,
		e: KonvaEventObject<MouseEvent>,
	) => void;
	handlePointMouseEnter: (index: number) => void;
	handlePointMouseLeave: () => void;
}

/**
 * Points collection renderer (for Shape mode only)
 * Renders interactive point circles at each vertex
 * Memoized to prevent unnecessary re-renders
 */
const ShapePoints = ({
	shape,
	hoveredPointIndex,
	selectedPointIndex,
	isDrawing,
	handlePointClick,
	handlePointMouseEnter,
	handlePointMouseLeave,
}: ShapePointsProps) => {
	return (
		<>
			{shape.points.map((point, index) => {
				const isPointHovered = hoveredPointIndex === index;
				const isPointSelected = selectedPointIndex === index;

				return (
					<Circle
						key={`${shape.id}-point-${index}`}
						x={point.xPos}
						y={point.yPos}
						radius={POINT_HOVER_RADIUS}
						fill={
							isPointHovered || isPointSelected
								? getStrokeColor(isPointSelected, isPointHovered)
								: "transparent"
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
		</>
	);
};

export default memo(ShapePoints);

