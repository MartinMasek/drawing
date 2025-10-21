import { useMemo } from "react";
import { CursorTypes } from "../components/header/header/drawing-types";
import type { CanvasText } from "~/types/drawing";

interface UseCursorLogicProps {
	cursorType: number;
	hoveredId: string | null;
	isPanning: boolean;
	isDragging: boolean;
	texts: ReadonlyArray<CanvasText>;
}

/**
 * Custom hook for cursor logic and state
 * Centralizes cursor-related calculations and helpers
 */
export const useCursorLogic = ({
	cursorType,
	hoveredId,
	isPanning,
	isDragging,
	texts,
}: UseCursorLogicProps) => {
	// Cursor type flags
	const cursorFlags = {
		isCursorDimesions: cursorType === CursorTypes.Dimesions,
		isCursorCurves: cursorType === CursorTypes.Curves,
		isCursorCorners: cursorType === CursorTypes.Corners,
		isCursorEdges: cursorType === CursorTypes.Egdes,
		isCursorText: cursorType === CursorTypes.Text,
	};

	// Helper function to check if cursor is interactive (can select shapes)
	const isInteractiveCursor =
		cursorFlags.isCursorDimesions ||
		cursorFlags.isCursorCurves ||
		cursorFlags.isCursorCorners ||
		cursorFlags.isCursorEdges;

	// Get the appropriate cursor based on current state
	const getCursor = () => {
		// Dragging a shape - highest priority
		if (isDragging) return "move";

		// Panning the canvas
		if (isPanning) return "grabbing";

		// Text cursor: show pointer only when hovering over existing text, text cursor otherwise
		if (cursorFlags.isCursorText) {
			const isHoveringOverText =
				hoveredId && texts.some((t) => t.id === hoveredId);
			return isHoveringOverText ? "pointer" : "text";
		}

		// Pencil cursor
		if (cursorFlags.isCursorDimesions && !hoveredId) {
			return 'url("/cursors/pencil.svg") 0 0, crosshair';
		}

		// Pointer cursor
		if (hoveredId && isInteractiveCursor) {
			return "pointer";
		}

		return "default";
	};

	return {
		cursorFlags,
		isInteractiveCursor,
		getCursor,
	};
};
