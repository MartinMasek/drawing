import { memo } from "react";
import type { CanvasShape } from "~/types/drawing";
import type { KonvaEventObject } from "konva/lib/Node";
import Edge from "../edge/Edge";

interface ShapeEdgesProps {
	shape: CanvasShape;
	hoveredEdgeIndex: number | null;
	selectedEdgeIndex: number | null;
	isDrawing: boolean;
	handleEdgeClick: (
		index: number,
		point1Id: string,
		point2Id: string,
		e: KonvaEventObject<MouseEvent>,
	) => void;
	handleEdgeMouseEnter: (index: number) => void;
	handleEdgeMouseLeave: () => void;
}

/**
 * Edges collection renderer
 * Maps through all shape points and renders corresponding edges
 * Memoized to prevent unnecessary re-renders when other parts of shape change
 */
const ShapeEdges = ({
	shape,
	hoveredEdgeIndex,
	selectedEdgeIndex,
	isDrawing,
	handleEdgeClick,
	handleEdgeMouseEnter,
	handleEdgeMouseLeave,
}: ShapeEdgesProps) => {
	return (
		<>
			{shape.points.map((point, index) => {
				const nextIndex = (index + 1) % shape.points.length;
				const nextPoint = shape.points[nextIndex];
				if (!nextPoint) return null;

				const isEdgeHovered = hoveredEdgeIndex === index;
				const isEdgeSelected = selectedEdgeIndex === index;

				const edge = shape.edges.find(
					(edge) => edge.point1Id === point.id && edge.point2Id === nextPoint.id,
				);

				return (
					<Edge
						key={`${shape.id}-edge-${index}`}
						shape={shape}
						index={index}
						point={point}
						nextPoint={nextPoint}
						isEdgeHovered={isEdgeHovered}
						isEdgeSelected={isEdgeSelected}
						isDrawing={isDrawing}
						handleEdgeClick={handleEdgeClick}
						handleEdgeMouseEnter={handleEdgeMouseEnter}
						handleEdgeMouseLeave={handleEdgeMouseLeave}
						edgeModifications={edge?.edgeModifications ?? []}
					/>
				);
			})}
		</>
	);
};

export default memo(ShapeEdges);

