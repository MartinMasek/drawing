import { memo } from "react";
import { Line } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { CanvasShape, EdgeModification, Point } from "~/types/drawing";
import { EdgeModificationType } from "@prisma/client";
import { getStrokeColor } from "~/utils/canvas-constants";
import EdgeStraight from "./EdgeStraight";
import EdgeWithCurves from "./EdgeWithCurves";

// Constants for interactive elements
const EDGE_STROKE_WIDTH = 2;
const EDGE_STROKE_WIDTH_HOVERED = 4;
const EDGE_STROKE_WIDTH_SELECTED = 6;
const EDGE_HIT_STROKE_WIDTH = 16;

interface EdgeProps {
	shape: CanvasShape;
	index: number;
	point: Point;
	nextPoint: Point;
	isEdgeHovered: boolean;
	isEdgeSelected: boolean;
	isDrawing: boolean;
	handleEdgeClick: (
		index: number,
		point1Id: string,
		point2Id: string,
		e: KonvaEventObject<MouseEvent>,
	) => void;
	handleEdgeMouseEnter: (index: number) => void;
	handleEdgeMouseLeave: () => void;
	edgeModifications: EdgeModification[];
}

/**
 * Edge component orchestrator
 * Routes to appropriate sub-component based on modification type:
 * - EdgeWithCurves for curve modifications
 * - EdgeStraight for straight edges and bumps
 * - Simple Line for edges without modifications
 */
const Edge = ({
	shape,
	index,
	point,
	nextPoint,
	isEdgeHovered,
	isEdgeSelected,
	isDrawing,
	handleEdgeClick,
	handleEdgeMouseEnter,
	handleEdgeMouseLeave,
	edgeModifications,
}: EdgeProps) => {
	// If there are modifications, check what type they are
	if (edgeModifications.length > 0) {
		// Check if we have any curve modifications
		const hasCurve = edgeModifications.some(
			(mod) =>
				mod.type === EdgeModificationType.BumpInCurve ||
				mod.type === EdgeModificationType.BumpOutCurve ||
				mod.type === EdgeModificationType.FullCurve,
		);

		if (hasCurve) {
			return (
				<EdgeWithCurves
					point={point}
					nextPoint={nextPoint}
					edgeModifications={edgeModifications}
					isEdgeHovered={isEdgeHovered}
					isEdgeSelected={isEdgeSelected}
					onClick={(e) => handleEdgeClick(index, point.id, nextPoint.id, e)}
					onMouseEnter={() => handleEdgeMouseEnter(index)}
					onMouseLeave={handleEdgeMouseLeave}
				/>
			);
		}

		return (
			<EdgeStraight
				point={point}
				nextPoint={nextPoint}
				edgeModifications={edgeModifications}
				isEdgeHovered={isEdgeHovered}
				isEdgeSelected={isEdgeSelected}
				onClick={(e) => handleEdgeClick(index, point.id, nextPoint.id, e)}
				onMouseEnter={() => handleEdgeMouseEnter(index)}
				onMouseLeave={handleEdgeMouseLeave}
			/>
		);
	}

	// Simple edge without modifications - render directly
	return (
		<Line
			key={`${shape.id}-edge-${index}`}
			points={[point.xPos, point.yPos, nextPoint.xPos, nextPoint.yPos]}
			stroke={getStrokeColor(isEdgeSelected, isEdgeHovered)}
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
};

export default memo(Edge);

