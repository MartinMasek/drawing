import { memo } from "react";
import { Shape as KonvaShape } from "react-konva";
import type { CanvasShape } from "~/types/drawing";
import { drawCompleteShapePath } from "~/components/shape/edgeUtils";

interface ShapeBackgroundProps {
	shape: CanvasShape;
	fillColor: string;
	isDrawing: boolean;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
}

/**
 * Shape background fill renderer
 * Handles fill rendering with edge modifications using sceneFunc
 * Memoized to prevent unnecessary re-renders
 */
const ShapeBackground = ({
	shape,
	fillColor,
	isDrawing,
	onMouseEnter,
	onMouseLeave,
}: ShapeBackgroundProps) => {
	return (
		<KonvaShape
			sceneFunc={(ctx, konvaShape) => {
				ctx.beginPath();
				drawCompleteShapePath(ctx, shape);
				ctx.closePath();
				ctx.fillStrokeShape(konvaShape);
			}}
			fill={fillColor}
			listening={!isDrawing}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		/>
	);
};

export default memo(ShapeBackground);

