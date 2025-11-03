import type { KonvaEventObject } from "konva/lib/Node";
import type { CanvasShape } from "~/types/drawing";
import { DrawingTab } from "~/components/header/header/drawing-types";
import { useShape } from "~/components/context/ShapeContext";
import { useShapeState } from "../hooks/useShapeState";
import { useShapeTransform } from "../hooks/useShapeTransform";
import { useShapeInteractions } from "../hooks/useShapeInteractions";
import DimensionsShape from "./shapeVariants/DimensionsShape";
import EdgesShape from "./shapeVariants/EdgesShape";
import ShapeShape from "./shapeVariants/ShapeShape";

interface ShapeProps {
	shape: CanvasShape;
	isSelected: boolean;
	isHovered: boolean;
	isDrawing: boolean;
	isDraggable: boolean;
	onClick: (e: KonvaEventObject<MouseEvent>) => void;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
	onDragStart?: () => void;
	onDragMove?: (newX: number, newY: number) => void;
	onDragEnd: (newX: number, newY: number) => void;
	onContextMenu: (e: KonvaEventObject<PointerEvent>) => void;
	activeTab?: number;
	isDebugMode: boolean;
	scale: number;
}

/**
 * Main Shape component
 * Composition of sub-components based on the active tab
 * If you need to understand how shape rendering works look at the README.md file in the root of the shape folder.
 */
const Shape = ({
	shape,
	isSelected,
	isHovered,
	isDrawing,
	isDraggable,
	onClick,
	onMouseEnter,
	onMouseLeave,
	onDragStart: onDragStartCallback,
	onDragMove: onDragMoveCallback,
	onDragEnd,
	onContextMenu,
	activeTab,
	isDebugMode,
	scale,
}: ShapeProps) => {
	const {
		dragOffset,
		setDragOffset,
		hoveredEdgeIndex,
		setHoveredEdgeIndex,
		hoveredPointIndex,
		setHoveredPointIndex,
		hoveredModificationId,
		setHoveredModificationId,
		setIsDragging,
	} = useShapeState(shape);

	const { centerX, centerY, absolutePoints } =
		useShapeTransform(shape, dragOffset);

	const { selectedEdge, selectedCorner } = useShape();

	const {
		handleDragStart,
		handleDragMove,
		handleDragEnd,
		handleEdgeClick,
		handlePointClick,
		handleEdgeMouseEnter,
		handleEdgeMouseLeave,
		handlePointMouseEnter,
		handlePointMouseLeave,
		handleModificationClick,
		handleEmptyEdgeClick,
		handleModificationMouseEnter,
		handleModificationMouseLeave,
	} = useShapeInteractions(
		shape,
		absolutePoints,
		centerX,
		centerY,
		isDrawing,
		{
			onDragStart: onDragStartCallback,
			onDragMove: onDragMoveCallback,
			onDragEnd,
			onClick,
			onMouseEnter,
			onMouseLeave,
		},
		setHoveredEdgeIndex,
		setHoveredPointIndex,
		setHoveredModificationId,
		setIsDragging,
		setDragOffset,
	);

	// Determine selected indices
	const selectedEdgeIndex =
		selectedEdge?.edgeIndex !== undefined &&
			selectedEdge?.shapeId === shape.id
			? selectedEdge.edgeIndex
			: null;

	const selectedPointIndex =
		selectedCorner?.pointIndex !== undefined &&
			selectedCorner?.shapeId === shape.id
			? selectedCorner.pointIndex
			: null;

	const selectedModificationId =
		selectedEdge?.edgeModification?.id !== undefined &&
			selectedEdge?.shapeId === shape.id
			? selectedEdge.edgeModification.id
			: null;

	// Render appropriate variant based on active tab
	if (activeTab === DrawingTab.Shape) {
		return (
			<ShapeShape
				shape={shape}
				centerX={centerX}
				centerY={centerY}
				dragOffset={dragOffset}
				absolutePoints={absolutePoints}
				isSelected={isSelected}
				isHovered={isHovered}
				isDrawing={isDrawing}
				isDraggable={isDraggable}
				hoveredEdgeIndex={hoveredEdgeIndex}
				selectedEdgeIndex={selectedEdgeIndex}
				hoveredModificationId={hoveredModificationId}
				selectedModificationId={selectedModificationId}
				hoveredPointIndex={hoveredPointIndex}
				selectedPointIndex={selectedPointIndex}
				onClick={onClick}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				onContextMenu={onContextMenu}
				handleEdgeClick={handleEdgeClick}
				handleModificationClick={handleModificationClick}
				handleEmptyEdgeClick={handleEmptyEdgeClick}
				handleEdgeMouseEnter={handleEdgeMouseEnter}
				handleEdgeMouseLeave={handleEdgeMouseLeave}
				handleModificationMouseEnter={handleModificationMouseEnter}
				handleModificationMouseLeave={handleModificationMouseLeave}
				handlePointClick={handlePointClick}
				handlePointMouseEnter={handlePointMouseEnter}
				handlePointMouseLeave={handlePointMouseLeave}
				onDragStart={handleDragStart}
				onDragMove={handleDragMove}
				onDragEnd={handleDragEnd}
				isDebugMode={isDebugMode}
				scale={scale}
			/>
		);
	}

	if (activeTab === DrawingTab.Edges) {
		return (
			<EdgesShape
				shape={shape}
				centerX={centerX}
				centerY={centerY}
				dragOffset={dragOffset}
				absolutePoints={absolutePoints}
				isSelected={isSelected}
				isHovered={isHovered}
				isDrawing={isDrawing}
				isDraggable={isDraggable}
				hoveredEdgeIndex={hoveredEdgeIndex}
				selectedEdgeIndex={selectedEdgeIndex}
				hoveredModificationId={hoveredModificationId}
				selectedModificationId={selectedModificationId}
				onClick={onClick}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				onContextMenu={onContextMenu}
				handleEdgeClick={handleEdgeClick}
				handleModificationClick={handleModificationClick}
				handleEmptyEdgeClick={handleEmptyEdgeClick}
				handleEdgeMouseEnter={handleEdgeMouseEnter}
				handleEdgeMouseLeave={handleEdgeMouseLeave}
				handleModificationMouseEnter={handleModificationMouseEnter}
				handleModificationMouseLeave={handleModificationMouseLeave}
				onDragStart={handleDragStart}
				onDragMove={handleDragMove}
				onDragEnd={handleDragEnd}
				isDebugMode={isDebugMode}
				scale={scale}
			/>
		);
	}

	// Default: Dimensions tab
	return (
		<DimensionsShape
			shape={shape}
			centerX={centerX}
			centerY={centerY}
			dragOffset={dragOffset}
			absolutePoints={absolutePoints}
			isSelected={isSelected}
			isHovered={isHovered}
			isDrawing={isDrawing}
			isDraggable={isDraggable}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			onContextMenu={onContextMenu}
			onDragStart={handleDragStart}
			onDragMove={handleDragMove}
			onDragEnd={handleDragEnd}
			isDebugMode={isDebugMode}
			scale={scale}
		/>
	);
};

export default Shape;
