import type { KonvaEventObject } from "konva/lib/Node";
import type { CanvasShape, Coordinate } from "~/types/drawing";

/**
 * Base props shared across all shape variant components
 * These props are required for all rendering modes
 */
export interface BaseShapeVariantProps {
	/** The shape data to render */
	shape: CanvasShape;
	/** X coordinate of shape center (for positioning) */
	centerX: number;
	/** Y coordinate of shape center (for positioning) */
	centerY: number;
	/** Current drag offset (for smooth dragging) */
	dragOffset: { x: number; y: number };
	/** Absolute coordinates of shape points (after transformations) */
	absolutePoints: Coordinate[];
	/** Whether the shape is currently selected */
	isSelected: boolean;
	/** Whether the shape is currently hovered */
	isHovered: boolean;
	/** Whether the user is currently drawing a new shape */
	isDrawing: boolean;
	/** Whether the shape can be dragged */
	isDraggable: boolean;
	/** Click event handler */
	onClick: (e: KonvaEventObject<MouseEvent>) => void;
	/** Mouse enter event handler */
	onMouseEnter: () => void;
	/** Mouse leave event handler */
	onMouseLeave: () => void;
	/** Context menu event handler */
	onContextMenu: (e: KonvaEventObject<PointerEvent>) => void;
	/** Drag start event handler */
	onDragStart: () => void;
	/** Drag move event handler */
	onDragMove: (e: KonvaEventObject<DragEvent>) => void;
	/** Drag end event handler */
	onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
	/** Whether debug visualization is enabled */
	isDebugMode: boolean;
	/** Current zoom scale */
	scale: number;
}

/**
 * Props for interactive edge handlers
 * Used by EdgesShape and ShapeShape variants
 */
export interface EdgeInteractionProps {
	/** Index of currently hovered edge */
	hoveredEdgeIndex: number | null;
	/** Index of currently selected edge */
	selectedEdgeIndex: number | null;
	/** ID of currently hovered modification */
	hoveredModificationId: string | null;
	/** ID of currently selected modification */
	selectedModificationId: string | null;
	/** Handler for edge click events (deprecated - use handleEmptyEdgeClick) */
	handleEdgeClick: (
		index: number,
		point1Id: string,
		point2Id: string,
		e: KonvaEventObject<MouseEvent>,
	) => void;
	/** Handler for modification click events */
	handleModificationClick: (
		edgeIndex: number,
		modificationId: string,
		e: KonvaEventObject<MouseEvent>,
	) => void;
	/** Handler for empty edge segment click events (for adding new modification) */
	handleEmptyEdgeClick: (
		edgeIndex: number,
		point1Id: string,
		point2Id: string,
		clickPosition: import("@prisma/client").EdgeShapePosition,
		e: KonvaEventObject<MouseEvent>,
	) => void;
	/** Handler for edge mouse enter events */
	handleEdgeMouseEnter: (index: number) => void;
	/** Handler for edge mouse leave events */
	handleEdgeMouseLeave: () => void;
	/** Handler for modification mouse enter events */
	handleModificationMouseEnter: (modificationId: string) => void;
	/** Handler for modification mouse leave events */
	handleModificationMouseLeave: () => void;
}

/**
 * Props for interactive point handlers
 * Used by ShapeShape variant only
 */
export interface PointInteractionProps {
	/** Index of currently hovered point */
	hoveredPointIndex: number | null;
	/** Index of currently selected point */
	selectedPointIndex: number | null;
	/** Handler for point click events */
	handlePointClick: (
		pointIndex: number,
		pointId: string,
		e: KonvaEventObject<MouseEvent>,
	) => void;
	/** Handler for point mouse enter events */
	handlePointMouseEnter: (index: number) => void;
	/** Handler for point mouse leave events */
	handlePointMouseLeave: () => void;
}

