import { memo } from "react";
import { Group } from "react-konva";
import type { CanvasShape } from "~/types/drawing";
import DebugPoint from "./DebugPoint";

interface PointsDebugLayerProps {
	shape: CanvasShape;
	centerX: number;
	centerY: number;
	dragOffset: { x: number; y: number };
	scale: number;
}

/**
 * Debug layer showing all points (shape vertices and modification points)
 * Shape points are shown in blue, modification points in magenta
 */
const PointsDebugLayer = ({
	shape,
	centerX,
	centerY,
	dragOffset,
	scale,
}: PointsDebugLayerProps) => {
	// Collect shape points (main vertices)
	const shapePoints = shape.points.map((point, index) => ({
		x: point.xPos,
		y: point.yPos,
		id: point.id,
		label: `[${index}] Shape`,
		color: "#00BFFF", // Blue for shape points
	}));

	// Collect all edge modification points
	const modificationPoints: Array<{
		x: number;
		y: number;
		id: string;
		label: string;
		color: string;
	}> = [];

	shape.edges.forEach((edge, edgeIndex) => {
		edge.edgeModifications.forEach((mod, modIndex) => {
			if (mod.points && mod.points.length > 0) {
				mod.points.forEach((point, pointIndex) => {
					modificationPoints.push({
						x: point.xPos,
						y: point.yPos,
						id: point.id || `temp-${edgeIndex}-${modIndex}-${pointIndex}`,
						label: "Mod Point",
						color: "#FF00FF", // Magenta for modification points
					});
				});
			}
		});
	});

	return (
		<Group
			x={shape.xPos + centerX + dragOffset.x}
			y={shape.yPos + centerY + dragOffset.y}
			offsetX={centerX}
			offsetY={centerY}
			rotation={shape.rotation}
			listening={false}
		>
			{/* Render shape points */}
			{shapePoints.map((point) => (
				<DebugPoint
					key={`debug-shape-${point.id}`}
					x={point.x}
					y={point.y}
					id={point.id}
					label={point.label}
					color={point.color}
					scale={scale}
				/>
			))}

			{/* Render modification points */}
			{modificationPoints.map((point) => (
				<DebugPoint
					key={`debug-mod-${point.id}`}
					x={point.x}
					y={point.y}
					id={point.id}
					label={point.label}
					color={point.color}
					scale={scale}
				/>
			))}
		</Group>
	);
};

export default memo(PointsDebugLayer);

