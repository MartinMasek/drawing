import { memo } from "react";
import { Shape } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { EdgeModification, Point } from "~/types/drawing";
import { getStrokeColor } from "~/utils/canvas-constants";
import { drawEdgeWithModifications } from "~/components/shape/edgeUtils";

// Constants for interactive elements
const EDGE_STROKE_WIDTH = 2;
const EDGE_STROKE_WIDTH_HOVERED = 4;
const EDGE_STROKE_WIDTH_SELECTED = 6;
const EDGE_HIT_STROKE_WIDTH = 16;

interface EdgeWithCurvesProps {
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
 * Curved edge renderer (handles BumpInCurve, BumpOutCurve, FullCurve)
 * Uses Konva Shape with sceneFunc for native quadratic curve rendering
 * Matches the clipping path logic for consistency
 */
const EdgeWithCurves = ({
	point,
	nextPoint,
	edgeModifications,
	isEdgeHovered,
	isEdgeSelected,
	onClick,
	onMouseEnter,
	onMouseLeave,
}: EdgeWithCurvesProps) => {
	return (
		<Shape
			sceneFunc={(ctx, shape) => {
				ctx.beginPath();
				drawEdgeWithModifications(ctx, point, nextPoint, edgeModifications, false);
				ctx.fillStrokeShape(shape);
			}}
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

export default memo(EdgeWithCurves);

