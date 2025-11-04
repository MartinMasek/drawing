import { useCallback } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import type { CanvasShape, Coordinate } from "~/types/drawing";
import { CornerType, EdgeModificationType, EdgeShapePosition } from "@prisma/client";
import {
	CursorTypes,
} from "~/components/header/header/drawing-types";
import { useDrawing } from "~/components/header/context/DrawingContext";
import { useShape } from "~/components/header/context/ShapeContext";
import { calculateAvailablePosition } from "../edge/edgeValidation";

interface ShapeInteractionHandlers {
	onDragStart?: () => void;
	onDragMove?: (newX: number, newY: number) => void;
	onDragEnd: (newX: number, newY: number) => void;
	onClick: (e: KonvaEventObject<MouseEvent>) => void;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
}

/**
 * Custom hook for shape interaction handlers
 * Handles edge/point clicks, hover states, and drag operations
 */
export const useShapeInteractions = (
	shape: CanvasShape,
	absolutePoints: Coordinate[],
	centerX: number,
	centerY: number,
	isDrawing: boolean,
	handlers: ShapeInteractionHandlers,
	setHoveredEdgeIndex: (index: number | null) => void,
	setHoveredPointIndex: (index: number | null) => void,
	setHoveredModificationId: (id: string | null) => void,
	setIsDragging: (isDragging: boolean) => void,
	setDragOffset: (offset: { x: number; y: number }) => void,
) => {
	const { cursorType, setCursorType } = useDrawing();
	const { setSelectedEdge, setSelectedCorner } = useShape();

	const handleDragStart = useCallback(() => {
		setIsDragging(true);
		handlers.onDragStart?.();
	}, [setIsDragging, handlers]);

	const handleDragMove = useCallback((e: KonvaEventObject<DragEvent>) => {
		const node = e.target;
		const offsetX = node.x() - (shape.xPos + centerX);
		const offsetY = node.y() - (shape.yPos + centerY);
		setDragOffset({ x: offsetX, y: offsetY });

		// Notify parent of drag position (for temp ID cache updates)
		if (handlers.onDragMove) {
			const newX = node.x() - centerX;
			const newY = node.y() - centerY;
			handlers.onDragMove(newX, newY);
		}
	}, [shape.xPos, shape.yPos, centerX, centerY, setDragOffset, handlers]);

	const handleDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
		const node = e.target;
		const newX = node.x() - centerX;
		const newY = node.y() - centerY;
		setIsDragging(false);
		handlers.onDragEnd(newX, newY);
	}, [centerX, centerY, setIsDragging, handlers]);

	const handleEdgeClick = useCallback((
		edgeIndex: number,
		point1Id: string,
		point2Id: string,
		e: KonvaEventObject<MouseEvent>,
	) => {
		if (isDrawing || e.evt.button !== 0) return;

		const startPoint = absolutePoints[edgeIndex];
		const endPoint = absolutePoints[(edgeIndex + 1) % absolutePoints.length];

		if (!startPoint || !endPoint) return;

		const doesEdgeExist = shape.edges.find((edge) => edge.point1Id === point1Id && edge.point2Id === point2Id);

		const hasModification = doesEdgeExist?.edgeModifications.length && doesEdgeExist?.edgeModifications.length > 0;
		const modification = hasModification ? doesEdgeExist?.edgeModifications[0] : null;

		setCursorType(CursorTypes.Curves);

		setSelectedEdge({
			shapeId: shape.id,
			edgeIndex,
			edgeId: doesEdgeExist?.id ?? null,
			edgePoint1Id: point1Id,
			edgePoint2Id: point2Id,
			edgeModification: {
				id: modification?.id ?? null,
				type: modification?.type ?? EdgeModificationType.None,
				position: modification?.position ?? EdgeShapePosition.Center,
				distance: modification?.distance ?? 0,
				depth: modification?.depth ?? 0,
				width: modification?.width ?? 0,
				sideAngleLeft: modification?.sideAngleLeft ?? 0,
				sideAngleRight: modification?.sideAngleRight ?? 0,
				fullRadiusDepth: modification?.fullRadiusDepth ?? 0,
				points: modification?.points ?? [],
			},
		});
		setSelectedCorner(null);
		handlers.onClick(e);
	}, [isDrawing, absolutePoints, shape, setCursorType, setSelectedEdge, setSelectedCorner, handlers]);

	const handlePointClick = useCallback((
		pointIndex: number,
		pointId: string,
		e: KonvaEventObject<MouseEvent>,
	) => {
		e.cancelBubble = true;
		if (isDrawing || e.evt.button !== 0) return;

		const point = absolutePoints[pointIndex];
		if (!point) return;

		const doesCornerExist = shape.corners.find((corner) => corner.pointId === pointId);

		setCursorType(CursorTypes.Corners);

		setSelectedCorner({
			shapeId: shape.id,
			pointIndex,
			pointId,
			cornerId: doesCornerExist?.id ?? null,
			type: doesCornerExist?.type ?? CornerType.None,
			clip: doesCornerExist?.clip ?? undefined,
			radius: doesCornerExist?.radius ?? undefined,
			modificationLength: doesCornerExist?.modificationLength ?? undefined,
			modificationDepth: doesCornerExist?.modificationDepth ?? undefined
		});
		setSelectedEdge(null);
		handlers.onClick(e);
	}, [isDrawing, absolutePoints, shape, setCursorType, setSelectedCorner, setSelectedEdge, handlers]);

	const handleEdgeMouseEnter = useCallback((index: number) => {
		if (!isDrawing) {
			setHoveredEdgeIndex(index);
			handlers.onMouseEnter();
		}
	}, [isDrawing, setHoveredEdgeIndex, handlers]);

	const handleEdgeMouseLeave = useCallback(() => {
		setHoveredEdgeIndex(null);
		handlers.onMouseLeave();
	}, [setHoveredEdgeIndex, handlers]);

	const handlePointMouseEnter = useCallback((index: number) => {
		if (!isDrawing) {
			setHoveredPointIndex(index);
			handlers.onMouseEnter();
		}
	}, [isDrawing, setHoveredPointIndex, handlers]);

	const handlePointMouseLeave = useCallback(() => {
		setHoveredPointIndex(null);
	}, [setHoveredPointIndex]);

	/**
	 * Handle click on a specific modification
	 * Selects that modification for editing
	 */
	const handleModificationClick = useCallback((
		edgeIndex: number,
		modificationId: string,
		e: KonvaEventObject<MouseEvent>,
	) => {
		if (isDrawing || e.evt.button !== 0) return;

		const point1Id = shape.points[edgeIndex]?.id;
		const point2Id = shape.points[(edgeIndex + 1) % shape.points.length]?.id;
		
		if (!point1Id || !point2Id) return;

		const edge = shape.edges.find((edge) => edge.point1Id === point1Id && edge.point2Id === point2Id);
		const modification = edge?.edgeModifications.find((m) => m.id === modificationId);

		if (!modification) return;

		setCursorType(CursorTypes.Curves);

		setSelectedEdge({
			shapeId: shape.id,
			edgeIndex,
			edgeId: edge?.id ?? null,
			edgePoint1Id: point1Id,
			edgePoint2Id: point2Id,
			edgeModification: {
				id: modification.id,
				type: modification.type,
				position: modification.position,
				distance: modification.distance,
				depth: modification.depth,
				width: modification.width,
				sideAngleLeft: modification.sideAngleLeft,
				sideAngleRight: modification.sideAngleRight,
				fullRadiusDepth: modification.fullRadiusDepth,
				points: modification.points,
			},
		});
		setSelectedCorner(null);
		handlers.onClick(e);
	}, [isDrawing, shape, setCursorType, setSelectedEdge, setSelectedCorner, handlers]);

	/**
	 * Handle click on empty edge segment (for adding new modification)
	 * Creates a new modification at the clicked position
	 * Opens side panel even if edge is full (will show warning message in UI)
	 */
	const handleEmptyEdgeClick = useCallback((
		edgeIndex: number,
		point1Id: string,
		point2Id: string,
		clickPosition: EdgeShapePosition,
		e: KonvaEventObject<MouseEvent>,
	) => {
		if (isDrawing || e.evt.button !== 0) return;

		const edge = shape.edges.find((edge) => edge.point1Id === point1Id && edge.point2Id === point2Id);

		// Import validation here to avoid circular dependency
		
		const validPosition = calculateAvailablePosition(edge, clickPosition);

		setCursorType(CursorTypes.Curves);

		// Always open side panel - it will show a message if edge is full
		setSelectedEdge({
			shapeId: shape.id,
			edgeIndex,
			edgeId: edge?.id ?? null,
			edgePoint1Id: point1Id,
			edgePoint2Id: point2Id,
			edgeModification: {
				id: null, // null = new modification
				type: EdgeModificationType.None,
				position: validPosition,
				distance: 0,
				depth: 0,
				width: 0,
				sideAngleLeft: 0,
				sideAngleRight: 0,
				fullRadiusDepth: 0,
				points: [],
			},
		});
		setSelectedCorner(null);
		handlers.onClick(e);
	}, [isDrawing, shape, setCursorType, setSelectedEdge, setSelectedCorner, handlers]);

	/**
	 * Handle mouse enter on a specific modification
	 * Only highlights that modification, not the entire edge
	 */
	const handleModificationMouseEnter = useCallback((modificationId: string) => {
		if (!isDrawing) {
			setHoveredModificationId(modificationId);
			handlers.onMouseEnter();
		}
	}, [isDrawing, setHoveredModificationId, handlers]);

	/**
	 * Handle mouse leave from a modification
	 */
	const handleModificationMouseLeave = useCallback(() => {
		setHoveredModificationId(null);
		handlers.onMouseLeave();
	}, [setHoveredModificationId, handlers]);

	return {
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
	};
};

