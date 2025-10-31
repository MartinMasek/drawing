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
					edgeIndex={index}
					point={point}
					nextPoint={nextPoint}
					edgeModifications={edgeModifications}
					isEdgeHovered={isEdgeHovered}
					isEdgeSelected={isEdgeSelected}
					hoveredModificationId={hoveredModificationId}
					selectedModificationId={selectedModificationId}
					handleModificationClick={handleModificationClick}
					handleEmptyEdgeClick={handleEmptyEdgeClick}
					handleEdgeMouseEnter={handleEdgeMouseEnter}
					handleEdgeMouseLeave={handleEdgeMouseLeave}
					handleModificationMouseEnter={handleModificationMouseEnter}
					handleModificationMouseLeave={handleModificationMouseLeave}
				/>
			);
		}

		return (
			<EdgeStraight
				edgeIndex={index}
				point={point}
				nextPoint={nextPoint}
				edgeModifications={edgeModifications}
				isEdgeHovered={isEdgeHovered}
				isEdgeSelected={isEdgeSelected}
				hoveredModificationId={hoveredModificationId}
				selectedModificationId={selectedModificationId}
				handleModificationClick={handleModificationClick}
				handleEmptyEdgeClick={handleEmptyEdgeClick}
				handleEdgeMouseEnter={handleEdgeMouseEnter}
				handleEdgeMouseLeave={handleEdgeMouseLeave}
				handleModificationMouseEnter={handleModificationMouseEnter}
				handleModificationMouseLeave={handleModificationMouseLeave}
			/>
		);
	}

	// Simple edge without modifications - render directly
	// Click on empty edge defaults to Center position
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
			onClick={(e) => {
				// Empty edge - add new modification at Center position
				const EdgeShapePosition = require("@prisma/client").EdgeShapePosition;
				handleEmptyEdgeClick(index, point.id, nextPoint.id, EdgeShapePosition.Center, e);
			}}
			onMouseEnter={() => handleEdgeMouseEnter(index)}
			onMouseLeave={handleEdgeMouseLeave}
		/>
	);
};

export default memo(Edge);

