import { memo } from "react";
import { Line } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { EdgeModification, Point } from "~/types/drawing";
import { getStrokeColor } from "~/utils/canvas-constants";

// Constants for interactive elements
const EDGE_STROKE_WIDTH = 2;
const EDGE_STROKE_WIDTH_HOVERED = 4;
const EDGE_STROKE_WIDTH_SELECTED = 6;
const EDGE_HIT_STROKE_WIDTH = 16;

interface EdgeStraightProps {
	point: Point;
	nextPoint: Point;
	edgeModifications: EdgeModification[];
	isEdgeHovered: boolean;
	isEdgeSelected: boolean;
	onClick: (e: KonvaEventObject<MouseEvent>) => void;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
}

/**
 * Straight edge renderer (handles simple edges and straight bumps)
 * Uses Konva Line with pre-calculated points for optimal performance
 */
const EdgeStraight = ({
	point,
	nextPoint,
	edgeModifications,
	isEdgeHovered,
	isEdgeSelected,
	onClick,
	onMouseEnter,
	onMouseLeave,
}: EdgeStraightProps) => {
	// Build points array from start point, modification points, and end point
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
			stroke={getStrokeColor(isEdgeSelected, isEdgeHovered)}
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
};

export default memo(EdgeStraight);

