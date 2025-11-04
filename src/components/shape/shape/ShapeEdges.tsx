import { memo } from "react";
import type { CanvasShape } from "~/types/drawing";
import type { KonvaEventObject } from "konva/lib/Node";
import Edge from "../edge/Edge";

interface ShapeEdgesProps {
	shape: CanvasShape;
	hoveredEdgeIndex: number | null;
	selectedEdgeIndex: number | null;
	hoveredModificationId: string | null;
	selectedModificationId: string | null;
	isDrawing: boolean;
	handleEdgeClick: (
		index: number,
		point1Id: string,
		point2Id: string,
		e: KonvaEventObject<MouseEvent>,
	) => void;
	handleModificationClick: (
		edgeIndex: number,
		modificationId: string,
		e: KonvaEventObject<MouseEvent>,
	) => void;
	handleEmptyEdgeClick: (
		edgeIndex: number,
		point1Id: string,
		point2Id: string,
		clickPosition: import("@prisma/client").EdgeShapePosition,
		e: KonvaEventObject<MouseEvent>,
	) => void;
	handleEdgeMouseEnter: (index: number) => void;
	handleEdgeMouseLeave: () => void;
	handleModificationMouseEnter: (modificationId: string) => void;
	handleModificationMouseLeave: () => void;
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
	hoveredModificationId,
	selectedModificationId,
	isDrawing,
	handleEdgeClick,
	handleModificationClick,
	handleEmptyEdgeClick,
	handleEdgeMouseEnter,
	handleEdgeMouseLeave,
	handleModificationMouseEnter,
	handleModificationMouseLeave,
}: ShapeEdgesProps) => {
	return (
		<>
			{shape.points.map((point, index) => {
				const nextIndex = (index + 1) % shape.points.length;
				const nextPoint = shape.points[nextIndex];
				if (!nextPoint) return null;

				// Edge is only hovered when hovering the edge as a whole, not a specific modification
				const isEdgeHovered = hoveredEdgeIndex === index && !hoveredModificationId;
				// Edge is only selected when selecting the edge as a whole, not a specific modification
				const isEdgeSelected = selectedEdgeIndex === index && !selectedModificationId;

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
					hoveredModificationId={hoveredModificationId}
					selectedModificationId={selectedModificationId}
					isDrawing={isDrawing}
					handleEdgeClick={handleEdgeClick}
					handleModificationClick={handleModificationClick}
					handleEmptyEdgeClick={handleEmptyEdgeClick}
					handleEdgeMouseEnter={handleEdgeMouseEnter}
					handleEdgeMouseLeave={handleEdgeMouseLeave}
					handleModificationMouseEnter={handleModificationMouseEnter}
					handleModificationMouseLeave={handleModificationMouseLeave}
					edgeModifications={edge?.edgeModifications ?? []}
				/>
			);
			})}
		</>
	);
};

export default memo(ShapeEdges);