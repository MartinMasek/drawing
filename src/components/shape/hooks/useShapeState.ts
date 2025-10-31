import { useState, useRef, useEffect } from "react";
import type { CanvasShape } from "~/types/drawing";

/**
 * Custom hook for managing shape component local state
 * Handles drag offsets, hover states, and dragging state
 */
export const useShapeState = (shape: CanvasShape) => {
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [hoveredEdgeIndex, setHoveredEdgeIndex] = useState<number | null>(null);
	const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
	const [hoveredModificationId, setHoveredModificationId] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const prevShapePos = useRef({ x: shape.xPos, y: shape.yPos });

	// Reset drag offset when shape position changes (after optimistic update)
	// But only if we're not currently dragging (to prevent snap-back during drag)
	useEffect(() => {
		const positionChanged =
			prevShapePos.current.x !== shape.xPos ||
			prevShapePos.current.y !== shape.yPos;

		if (positionChanged && !isDragging) {
			setDragOffset({ x: 0, y: 0 });
			prevShapePos.current = { x: shape.xPos, y: shape.yPos };
		} else if (positionChanged && isDragging) {
			// Position changed while dragging (e.g., temp ID replaced with real ID)
			// Update the reference but keep the dragOffset to maintain visual position
			prevShapePos.current = { x: shape.xPos, y: shape.yPos };
		}
	}, [shape.xPos, shape.yPos, isDragging]);

	return {
		dragOffset,
		setDragOffset,
		hoveredEdgeIndex,
		setHoveredEdgeIndex,
		hoveredPointIndex,
		setHoveredPointIndex,
		hoveredModificationId,
		setHoveredModificationId,
		isDragging,
		setIsDragging,
	};
};
