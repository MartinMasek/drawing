import { memo } from "react";
import { Group } from "react-konva";
import type { Context } from "konva/lib/Context";
import type { CanvasShape } from "~/types/drawing";
import { getFillColor } from "~/utils/canvas-constants";
import ShapeEdgeMeasurements from "../../shapeMeasurements/ShapeEdgeMeasurements";
import ShapeBackground from "../ShapeBackground";
import ShapeEdges from "../ShapeEdges";
import ShapeDebugLayer from "../../debug/ShapeDebugLayer";
import PointsDebugLayer from "../../debug/PointsDebugLayer";
import { drawCompleteShapePath } from "~/components/shape/edgeUtils";
import type {
	BaseShapeVariantProps,
	EdgeInteractionProps,
} from "./shared";

/**
 * Props for Edges shape variant
 * Extends base props with edge interaction handlers
 */
interface EdgesShapeProps extends BaseShapeVariantProps, EdgeInteractionProps {}

/**
 * Create clipping function for a shape with edge modifications
 */
const createShapeClipFunc = (shape: CanvasShape) => (ctx: Context) => {
	ctx.beginPath();
	drawCompleteShapePath(ctx, shape);
	ctx.closePath();
};

/**
 * Edges Shape - Interactive edges rendering for Edges tab
 * Shows individual edges that can be clicked and modified, but not points
 */
const EdgesShape = ({
	shape,
	centerX,
	centerY,
	dragOffset,
	absolutePoints,
	isSelected,
	isHovered,
	isDrawing,
	isDraggable,
	hoveredEdgeIndex,
	selectedEdgeIndex,
	onMouseEnter,
	onMouseLeave,
	onContextMenu,
	handleEdgeClick,
	handleEdgeMouseEnter,
	handleEdgeMouseLeave,
	onDragStart,
	onDragMove,
	onDragEnd,
	isDebugMode,
	scale,
}: EdgesShapeProps) => {
	return (
		<>
			<Group
				x={shape.xPos + centerX}
				y={shape.yPos + centerY}
				offsetX={centerX}
				offsetY={centerY}
				rotation={shape.rotation}
				draggable={isDraggable && !isDrawing}
				listening={!isDrawing}
				onDragStart={onDragStart}
				onDragMove={onDragMove}
				onDragEnd={onDragEnd}
				onContextMenu={onContextMenu}
				clipFunc={createShapeClipFunc(shape)}
			>
				{/* Draggable background fill */}
				<ShapeBackground
					shape={shape}
					fillColor={getFillColor(isSelected, isHovered)}
					isDrawing={isDrawing}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
				/>

				{/* Individual edges */}
				<ShapeEdges
					shape={shape}
					hoveredEdgeIndex={hoveredEdgeIndex}
					selectedEdgeIndex={selectedEdgeIndex}
					isDrawing={isDrawing}
					handleEdgeClick={handleEdgeClick}
					handleEdgeMouseEnter={handleEdgeMouseEnter}
					handleEdgeMouseLeave={handleEdgeMouseLeave}
				/>
		</Group>

		{/* Edge measurements - outside of clipped group */}
		<ShapeEdgeMeasurements points={absolutePoints} scale={scale} shape={shape} />

			{/* Debug layers - render on top of everything, outside of clipped group */}
			{isDebugMode && (
				<>
					<ShapeDebugLayer
						shape={shape}
						centerX={centerX}
						centerY={centerY}
						dragOffset={dragOffset}
					/>
					<PointsDebugLayer
						shape={shape}
						centerX={centerX}
						centerY={centerY}
						dragOffset={dragOffset}
						scale={scale}
					/>
				</>
			)}
		</>
	);
};

export default memo(EdgesShape);

