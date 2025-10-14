import { useMemo } from "react";
import { CursorTypes } from "../components/header/header/drawing-types";
import type { CanvasText } from "~/types/drawing";

interface UseCursorLogicProps {
	cursorType: number;
	hoveredId: string | null;
	isPanning: boolean;
	allTexts: CanvasText[];
}

/**
 * Custom hook for cursor logic and state
 * Centralizes cursor-related calculations and helpers
 */
export const useCursorLogic = ({
	cursorType,
	hoveredId,
	isPanning,
	allTexts,
}: UseCursorLogicProps) => {
	// Cursor type flags
	const cursorFlags = useMemo(
		() => ({
			isCursorDimesions: cursorType === CursorTypes.Dimesions,
			isCursorCurves: cursorType === CursorTypes.Curves,
			isCursorCorners: cursorType === CursorTypes.Corners,
			isCursorEdges: cursorType === CursorTypes.Egdes,
			isCursorText: cursorType === CursorTypes.Text,
		}),
		[cursorType],
	);

	// Helper function to check if cursor is interactive (can select shapes)
	const isInteractiveCursor = useMemo(
		() =>
			cursorFlags.isCursorDimesions ||
			cursorFlags.isCursorCurves ||
			cursorFlags.isCursorCorners ||
			cursorFlags.isCursorEdges,
		[cursorFlags],
	);

	// Get the appropriate cursor based on current state
	const getCursor = useMemo(
		() => () => {
			if (isPanning) return "grabbing";

			// Text cursor: show pointer only when hovering over existing text, text cursor otherwise
			if (cursorFlags.isCursorText) {
				const isHoveringOverText =
					hoveredId && allTexts.some((t) => t.id === hoveredId);
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
		},
		[isPanning, cursorFlags, hoveredId, allTexts, isInteractiveCursor],
	);

	return {
		cursorFlags,
		isInteractiveCursor,
		getCursor,
	};
};
