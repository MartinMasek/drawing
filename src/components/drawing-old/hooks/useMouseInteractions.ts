import type { KonvaEventObject } from "konva/lib/Node";
import { useCallback } from "react";
import { CursorTypes } from "../../header/header/drawing-types";
import type { CanvasText } from "~/types/drawing";

interface UseMouseInteractionsProps {
	cursorType: number;
	hoveredId: string | null;
	allTexts: CanvasText[];
	newTextPos: { x: number; y: number } | null;
	setNewTextPos: (pos: { x: number; y: number } | null) => void;
	handleMouseDown: (e: KonvaEventObject<MouseEvent>) => void;
}

/**
 * Custom hook for handling mouse interactions on the canvas
 * Centralizes mouse down logic for different cursor types
 */
export const useMouseInteractions = ({
	cursorType,
	hoveredId,
	allTexts,
	newTextPos,
	setNewTextPos,
	handleMouseDown,
}: UseMouseInteractionsProps) => {
	const isCursorText = cursorType === CursorTypes.Text;

	const handleCanvasMouseDown = useCallback(
		(e: KonvaEventObject<MouseEvent>) => {
			// Always handle panning first (middle click or shift+left click)
			const isMiddleClick = e.evt.button === 1; // middle mouse button
			const isShiftLeftClick = e.evt.button === 0 && e.evt.shiftKey;

			if (isMiddleClick || isShiftLeftClick) {
				handleMouseDown(e);
				return;
			}

			// Handle text cursor logic for left clicks only
			if (isCursorText && e.evt.button === 0) {
				// Only add new text if not hovering over existing text
				// Allow adding text over shapes or empty space
				const isHoveringOverText =
					hoveredId && allTexts.some((t) => t.id === hoveredId);

				if (!isHoveringOverText) {
					const stage = e.target.getStage();
					const pointerPosition = stage?.getPointerPosition();
					if (pointerPosition && newTextPos === null) {
						setNewTextPos(pointerPosition);
					} else {
						setNewTextPos(null);
					}
				} else {
					// If hovering over text, let the text handle the click
					handleMouseDown(e);
				}
			} else {
				handleMouseDown(e);
			}
		},
		[
			isCursorText,
			hoveredId,
			allTexts,
			newTextPos,
			setNewTextPos,
			handleMouseDown,
		],
	);

	return {
		handleCanvasMouseDown,
	};
};
