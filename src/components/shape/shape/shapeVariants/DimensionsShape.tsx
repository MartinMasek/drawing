import { memo } from "react";
import { Shape as KonvaShape } from "react-konva";
import { getFillColor, getStrokeColor } from "~/utils/canvas-constants";
import ShapeEdgeMeasurements from "../../shapeMeasurements/ShapeEdgeMeasurements";
import ShapeDebugLayer from "../../debug/ShapeDebugLayer";
import { drawCompleteShapePath } from "~/components/shape/edgeUtils";
import type { BaseShapeVariantProps } from "./shared";

/**
 * Props for Dimensions shape variant
 * Extends base props with no additional requirements
 */
interface DimensionsShapeProps extends BaseShapeVariantProps {}

/**
 * Dimensions Shape - Simple shape rendering for Dimensions tab
 * Renders the complete shape with all edge modifications but without interactive edges/points
 */
const DimensionsShape = ({
	shape,
	centerX,
	centerY,
	dragOffset,
	absolutePoints,
	isSelected,
	isHovered,
	isDrawing,
	isDraggable,
	onClick,
	onMouseEnter,
	onMouseLeave,
	onContextMenu,
	onDragStart,
	onDragMove,
	onDragEnd,
	isDebugMode,
	scale,
}: DimensionsShapeProps) => {
	return (
		<>
			{isDebugMode && (
				<ShapeDebugLayer
					shape={shape}
					centerX={centerX}
					centerY={centerY}
					dragOffset={dragOffset}
				/>
			)}
			<KonvaShape
				x={shape.xPos + centerX}
				y={shape.yPos + centerY}
				offsetX={centerX}
				offsetY={centerY}
				rotation={shape.rotation}
				sceneFunc={(ctx, konvaShape) => {
					ctx.beginPath();
					drawCompleteShapePath(ctx, shape);
					ctx.closePath();
					ctx.fillStrokeShape(konvaShape);
				}}
				stroke={getStrokeColor(isSelected, isHovered)}
				fill={getFillColor(isSelected, isHovered)}
				strokeWidth={2}
				listening={!isDrawing}
				draggable={isDraggable && !isDrawing}
				onClick={(e) => {
					if (!isDrawing && e.evt.button === 0) {
						onClick(e);
					}
				}}
				onMouseEnter={() => !isDrawing && onMouseEnter()}
				onMouseLeave={onMouseLeave}
				onContextMenu={onContextMenu}
				onDragMove={onDragMove}
				onDragEnd={onDragEnd}
				onDragStart={onDragStart}
			/>

			<ShapeEdgeMeasurements points={absolutePoints} scale={scale} shape={shape} />
		</>
	);
};

export default memo(DimensionsShape);

