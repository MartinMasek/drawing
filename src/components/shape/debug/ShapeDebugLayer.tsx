import { memo } from "react";
import { Group, Line } from "react-konva";
import type { CanvasShape } from "~/types/drawing";

interface ShapeDebugLayerProps {
	shape: CanvasShape;
	centerX: number;
	centerY: number;
	dragOffset: { x: number; y: number };
}

/**
 * Debug layer showing edge indices (start and end edges in red)
 * Used for visualizing which edges are the shape's designated start/end
 */
const ShapeDebugLayer = ({
	shape,
	centerX,
	centerY,
	dragOffset,
}: ShapeDebugLayerProps) => {
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
			{/* Start edge (red) */}
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
			{/* End edge (red) */}
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

export default memo(ShapeDebugLayer);

