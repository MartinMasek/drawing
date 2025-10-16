import type { KonvaEventObject } from "konva/lib/Node";
import { useCallback, useMemo } from "react";
import { CursorTypes } from "../components/header/header/drawing-types";
import type { CanvasText, CanvasShape, CanvasTextData } from "~/types/drawing";
import { useCanvasNavigation } from "./useCanvasNavigation";
import { useCursorLogic } from "./useCursorLogic";

interface UseMouseInteractionsProps {
	cursorType: number;
	hoveredId: string | null;
	setHoveredId: (id: string | null) => void;
	texts: ReadonlyArray<CanvasText>;
	isPanning: boolean;
	isDrawing: boolean;
	editingText: CanvasText | null;
	setEditingText: (text: CanvasText | null) => void;
	newTextPos: { x: number; y: number } | null;
	setNewTextPos: (pos: { x: number; y: number } | null) => void;
	handleDrawStart: (e: KonvaEventObject<MouseEvent>) => void;
	handleDrawMove: (e: KonvaEventObject<MouseEvent>) => void;
	handleDrawEnd: () => void;
	handleSelectShape: (shape: CanvasShape) => void;
	selectedShape: CanvasShape | null;
}

/**
 * Unified hook for mouse interactions on the canvas
 * Handles drawing, navigation, cursor logic, and text cursor interactions
 */
export const useMouseInteractions = ({
	cursorType,
	hoveredId,
	setHoveredId,
	texts,
	isPanning,
	isDrawing,
	editingText,
	setEditingText,
	newTextPos,
	setNewTextPos,
	handleDrawStart,
	handleDrawMove,
	handleDrawEnd,
	handleSelectShape,
	selectedShape,
}: UseMouseInteractionsProps) => {
	// Cursor logic
	const { isInteractiveCursor, getCursor: getCursorFromHook } = useCursorLogic({
		cursorType,
		hoveredId,
		isPanning,
		texts,
	});

	// Navigation
	const {
		handleWheel,
		handleMouseDown: handleNavMouseDown,
		handleMouseMove: handleNavMouseMove,
		handleMouseUp: handleNavMouseUp,
	} = useCanvasNavigation();

	// Combined cursor logic that integrates drawing and our cursor system
	const getCombinedCursor = useCallback(
		(e?: KonvaEventObject<MouseEvent>) => {
			// Drawing takes priority
			if (isDrawing) {
				return 'url("/cursors/draw_small.svg") 16 16, crosshair';
			}

			// Use our cursor logic for non-drawing states
			return getCursorFromHook();
		},
		[isDrawing, getCursorFromHook],
	);

	// Text-specific mouse interactions
	const handleTextMouseDown = useCallback(
		(e: KonvaEventObject<MouseEvent>) => {
			// Only handle text cursor logic for left clicks
			if (cursorType === CursorTypes.Text && e.evt.button === 0) {
				// Only add new text if not hovering over existing text
				// Allow adding text over shapes or empty space
				const isHoveringOverText =
					hoveredId && texts.some((t) => t.id === hoveredId);

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
					handleNavMouseDown(e);
				}
			} else {
				handleNavMouseDown(e);
			}
		},
		[
			cursorType,
			hoveredId,
			texts,
			newTextPos,
			setNewTextPos,
			handleNavMouseDown,
		],
	);

	// Unified mouse down handler
	const handleMouseDown = useCallback(
		(e: KonvaEventObject<MouseEvent>) => {
			// Reset text editing if clicking on empty canvas
			if (editingText !== null && e.target === e.target.getStage()) {
				setEditingText(null);
				setHoveredId(null); // Clear hover state to reset cursor
				return;
			}

			// Handle text cursor logic first
			if (cursorType === CursorTypes.Text) {
				handleTextMouseDown(e);
				return;
			}

			// Drawing takes priority unless panning
			if (
				!isPanning &&
				!e.evt.shiftKey &&
				e.evt.button === 0 &&
				!hoveredId &&
				!selectedShape
			) {
				handleDrawStart(e);
			}
			// Navigation handling
			handleNavMouseDown(e);
		},
		[
			editingText,
			setEditingText,
			setHoveredId,
			cursorType,
			handleTextMouseDown,
			isPanning,
			hoveredId,
			handleDrawStart,
			handleNavMouseDown,
			selectedShape,
		],
	);

	// Unified mouse move handler
	const handleMouseMove = useCallback(
		(e: KonvaEventObject<MouseEvent>) => {
			// Handle drawing
			handleDrawMove(e);
			// Handle navigation
			handleNavMouseMove(e);
		},
		[handleDrawMove, handleNavMouseMove],
	);

	// Unified mouse up handler
	const handleMouseUp = useCallback(
		(e: KonvaEventObject<MouseEvent>) => {
			handleDrawEnd();
			handleNavMouseUp(e);
		},
		[handleDrawEnd, handleNavMouseUp],
	);

	// Memoized return object
	const returnValue = useMemo(
		() => ({
			// Mouse event handlers
			handleMouseDown,
			handleMouseMove,
			handleMouseUp,
			handleWheel,
			getCombinedCursor,

			// Cursor logic
			isInteractiveCursor,

			// Shape selection
			handleSelectShape,
		}),
		[
			handleMouseDown,
			handleMouseMove,
			handleMouseUp,
			handleWheel,
			getCombinedCursor,
			isInteractiveCursor,
			handleSelectShape,
		],
	);

	return returnValue;
};
