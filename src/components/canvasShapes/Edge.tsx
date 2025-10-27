import {
	SHAPE_DEFAULT_STROKE_COLOR,
	SHAPE_HOVERED_STROKE_COLOR,
	SHAPE_SELECTED_STROKE_COLOR,
} from "~/utils/canvas-constants";
import { Line, Shape } from "react-konva";
import type { CanvasShape, EdgeModification, Point } from "~/types/drawing";
import type { KonvaEventObject } from "konva/lib/Node";
import { drawEdgeWithModifications } from "./edgeUtils";

// Constants for interactive elements
const EDGE_STROKE_WIDTH = 2;
const EDGE_STROKE_WIDTH_HOVERED = 4;
const EDGE_STROKE_WIDTH_SELECTED = 6;
const EDGE_HIT_STROKE_WIDTH = 16;
const POINT_HOVER_RADIUS = 20;
const POINT_HOVER_OPACITY = 0.8;

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

const getStrokeColor = (isSelected: boolean, isHovered: boolean): string => {
	if (isSelected) return SHAPE_SELECTED_STROKE_COLOR;
	if (isHovered) return SHAPE_HOVERED_STROKE_COLOR;
	return SHAPE_DEFAULT_STROKE_COLOR;
};

export const Edge = ({
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
	if (edgeModifications.length > 0) {
		return (
			<EdgeWithModifications
				isEdgeHovered={isEdgeHovered}
				isEdgeSelected={isEdgeSelected}
				edgeModifications={edgeModifications}
				point={point}
				nextPoint={nextPoint}
				onClick={(e) => handleEdgeClick(index, point.id, nextPoint.id, e)}
				onMouseEnter={() => handleEdgeMouseEnter(index)}
				onMouseLeave={handleEdgeMouseLeave}
			/>
		);
	}

	return (
		<Line
			key={`${shape.id}-edge-${index}`}
			points={[point.xPos, point.yPos, nextPoint.xPos, nextPoint.yPos]}
			stroke={
				isEdgeHovered
					? SHAPE_HOVERED_STROKE_COLOR
					: getStrokeColor(isEdgeSelected, isEdgeHovered)
			}
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

const EdgeWithModifications = ({
	edgeModifications,
	point,
	nextPoint,
	isEdgeHovered,
	isEdgeSelected,
	onClick,
	onMouseEnter,
	onMouseLeave,
}: {
	edgeModifications: EdgeModification[];
	point: Point;
	nextPoint: Point;
	isEdgeHovered: boolean;
	isEdgeSelected: boolean;
	onClick: (e: KonvaEventObject<MouseEvent>) => void;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
}) => {
	// Use pre-calculated points from edge modifications if available
	// Otherwise fall back to drawing the edge with modifications
	const hasPreCalculatedPoints = edgeModifications.some(
		(mod) => mod.points && mod.points.length > 0
	);

	if (hasPreCalculatedPoints) {
		// Flatten all points from all modifications into a single array
		const allPoints: number[] = [point.xPos, point.yPos];
		
		for (const mod of edgeModifications) {
			if (mod.points && mod.points.length > 0) {
				for (const p of mod.points) {
					allPoints.push(p.xPos, p.yPos);
				}
			}
		}
		
		// Add the end point if not already included
		const lastX = allPoints[allPoints.length - 2];
		const lastY = allPoints[allPoints.length - 1];
		if (lastX !== nextPoint.xPos || lastY !== nextPoint.yPos) {
			allPoints.push(nextPoint.xPos, nextPoint.yPos);
		}

		return (
			<Line
				points={allPoints}
				stroke={
					isEdgeHovered
						? SHAPE_HOVERED_STROKE_COLOR
						: getStrokeColor(isEdgeSelected, isEdgeHovered)
				}
				strokeWidth={
					isEdgeSelected
						? EDGE_STROKE_WIDTH_SELECTED
						: isEdgeHovered
							? EDGE_STROKE_WIDTH_HOVERED
							: EDGE_STROKE_WIDTH
				}
				hitStrokeWidth={EDGE_HIT_STROKE_WIDTH}
				listening
				onClick={onClick}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
			/>
		);
	}

	// Fallback: Use Shape with drawEdgeWithModifications for backwards compatibility
	return (<></>);
};
