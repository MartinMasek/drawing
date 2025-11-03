import type { KonvaEventObject } from "konva/lib/Node";
import { useCallback, useMemo } from "react";
import { CursorTypes, DrawingTab } from "~/types/drawing";
import type { CanvasText, CanvasShape, CanvasTextData } from "~/types/drawing";
import { useCanvasNavigation } from "./useCanvasNavigation";
import { useCursorLogic } from "./useCursorLogic";

interface UseMouseInteractionsProps {
	cursorType: number;
	hoveredId: string | null;
	setHoveredId: (id: string | null) => void;
	texts: ReadonlyArray<CanvasText>;
	isPanning: boolean;
	isDragging: boolean;
	isDrawing: boolean;
	selectedText: CanvasText | null;
	setSelectedText: (text: CanvasText | null) => void;
	newTextPos: { x: number; y: number } | null;
	setNewTextPos: (pos: { x: number; y: number } | null) => void;
	handleDrawStart: (e: KonvaEventObject<MouseEvent>) => void;
	handleDrawMove: (e: KonvaEventObject<MouseEvent>) => void;
	handleDrawEnd: () => void;
	handleSelectShape: (
		shape: CanvasShape,
		e: KonvaEventObject<MouseEvent>,
	) => void;
	selectedShape: CanvasShape | null;
	drawingTab: number;
	closeContextMenu: () => void;
	closeCutoutContextMenu: () => void;
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
	isDragging,
	isDrawing,
	selectedText,
	setSelectedText,
	newTextPos,
	setNewTextPos,
	handleDrawStart,
	handleDrawMove,
	handleDrawEnd,
	handleSelectShape,
	selectedShape,
	drawingTab,
	closeContextMenu,
	closeCutoutContextMenu,
}: UseMouseInteractionsProps) => {
	// Cursor logic
	const { isInteractiveCursor, getCursor: getCursorFromHook } = useCursorLogic({
		cursorType,
		hoveredId,
		isPanning,
		isDragging,
		texts,
	});

	// Navigation
	const {
		handleWheel,
		handleMouseDown: handleNavMouseDown,
		handleMouseMove: handleNavMouseMove,
		handleMouseUp: handleNavMouseUp,
	} = useCanvasNavigation();

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
			// Close context menu if clicking on empty canvas (stage)
			if (e.target === e.target.getStage()) {
				closeContextMenu();
				closeCutoutContextMenu();
			}

			// Reset text editing if clicking on empty canvas
			if (selectedText !== null && e.target === e.target.getStage()) {
				setSelectedText(null);
				setHoveredId(null); // Clear hover state to reset cursor
				return;
			}

			// Handle text cursor logic first
			if (
				cursorType === CursorTypes.Text &&
				e.evt.button === 0 &&
				!e.evt.shiftKey
			) {
				handleTextMouseDown(e);
				return;
			}

			// Drawing takes priority unless panning
			if (
				!isPanning &&
				!e.evt.shiftKey &&
				e.evt.button === 0 &&
				!hoveredId &&
				!selectedShape &&
				drawingTab === DrawingTab.Dimensions
			) {
				handleDrawStart(e);
			}
			// Navigation handling
			handleNavMouseDown(e);
		},
		[
			closeContextMenu,
			closeCutoutContextMenu,
			selectedText,
			setSelectedText,
			setHoveredId,
			cursorType,
			handleTextMouseDown,
			isPanning,
			hoveredId,
			handleDrawStart,
			handleNavMouseDown,
			selectedShape,
			drawingTab,
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
			getCursorFromHook,

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
			getCursorFromHook,
			isInteractiveCursor,
			handleSelectShape,
		],
	);

	return returnValue;
};
