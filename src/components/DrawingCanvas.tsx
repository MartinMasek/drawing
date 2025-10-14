import type { KonvaEventObject } from "konva/lib/Node";
import { useRouter } from "next/router";
import { Circle, Rect, Layer, Line, Stage, Text } from "react-konva";
import { useShapeDrawing } from "~/hooks/useShapeDrawing";
import type { CanvasShape } from "~/types/drawing";
import { useCanvasNavigation } from "../hooks/useCanvasNavigation";
import { useCreateShape } from "../hooks/useCreateShape";
import { useUpdateShape } from "../hooks/useUpdateShape";
import { useState } from "react";
import CursorPanel from "./drawing-old/CursorPanel";
import DebugSidePanel from "./drawing-old/DebugSidePanel";
import SidePanel from "./drawing-old/SidePanel";
import { useCursorLogic } from "./drawing-old/hooks/useCursorLogic";
import { useDrawing } from "./header/context/DrawingContext";
import { useShape } from "./header/context/ShapeContext";
import { CursorTypes } from "./header/header/drawing-types";
import CanvasTextInput from "./canvasTextInput/CanvasTextInput";
import { useText } from "./drawing-old/hooks/useText";

interface DrawingCanvasProps {
	shapes?: ReadonlyArray<CanvasShape>;
}

const DrawingCanvas = ({ shapes = [] }: DrawingCanvasProps) => {
	const router = useRouter();
	const idParam = router.query.id;
	const designId = Array.isArray(idParam) ? idParam[0] : idParam;

	const {
		containerSize,
		containerRef,
		canvasPosition,
		zoom,
		setIsOpenSideDialog,
		cursorType,
		isPanning,
	} = useDrawing();
	const { selectedShape, setSelectedShape } = useShape();
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const [isDebugMode, setIsDebugMode] = useState(false);
	// Track temporary shape updates during resize (before persisting to DB)
	const [tempShapeUpdates, setTempShapeUpdates] = useState<
		Map<
			string,
			{
				xPos: number;
				yPos: number;
				points: Array<{ xPos: number; yPos: number }>;
			}
		>
	>(new Map());

	// Shape mutations
	const createShapeMutation = useCreateShape(designId);
	const updateShapeMutation = useUpdateShape(designId);

	// Merge temporary updates with shapes for rendering
	const displayShapes = shapes.map((shape) => {
		const tempUpdate = tempShapeUpdates.get(shape.id);
		return tempUpdate ? { ...shape, ...tempUpdate } : shape;
	});

	const {
		handleWheel,
		handleMouseDown: handleNavMouseDown,
		handleMouseMove: handleNavMouseMove,
		handleMouseUp: handleNavMouseUp,
	} = useCanvasNavigation();

	const handleShapeComplete = (shape: {
		xPos: number;
		yPos: number;
		points: Array<{ xPos: number; yPos: number }>;
	}) => {
		if (!designId) return;

		createShapeMutation.mutate({
			designId,
			xPos: shape.xPos,
			yPos: shape.yPos,
			rotation: 0,
			points: shape.points,
		});
	};

	const handleShapeUpdate = (
		shapeId: string,
		updates: {
			xPos: number;
			yPos: number;
			points: Array<{ xPos: number; yPos: number }>;
		},
	) => {
		// Update temporary state during drag for smooth visual feedback
		setTempShapeUpdates((prev) => {
			const newMap = new Map(prev);
			newMap.set(shapeId, updates);
			return newMap;
		});
	};

	const handleShapeUpdateComplete = (
		shapeId: string,
		updates: {
			xPos: number;
			yPos: number;
			points: Array<{ xPos: number; yPos: number }>;
		},
	) => {
		// Clear temporary state and persist to database
		setTempShapeUpdates((prev) => {
			const newMap = new Map(prev);
			newMap.delete(shapeId);
			return newMap;
		});

		updateShapeMutation.mutate({
			shapeId,
			xPos: updates.xPos,
			yPos: updates.yPos,
			points: updates.points,
		});
	};

	const {
		handleDrawStart,
		handleDrawMove,
		handleDrawEnd,
		getCursor,
		getDraftBounds,
		isDrawing,
		draftShape,
		canChangeDirectionNow,
		actualyChangingDirectionNow,
		lastDirection,
	} = useShapeDrawing(
		displayShapes,
		zoom,
		canvasPosition,
		handleShapeComplete,
		// handleShapeUpdate,
		// handleShapeUpdateComplete,
	);

	// Log draftBounds whenever it changes
	const draftBounds = getDraftBounds();

	const {
		newTextPos,
		editingText,
		setEditingText,
		handleSave,
		handleDelete: originalHandleDelete,
		handleEscape,
		handleTextDragEnd,
		currentTextPos,
		setNewTextPos,
		allTexts,
	} = useText(designId);

	// Cursor logic and state
	const { isInteractiveCursor, getCursor: getCursorFromHook } = useCursorLogic({
		cursorType,
		hoveredId,
		isPanning,
		allTexts,
	});

	// Wrap handleDelete to clear hoveredId when text is deleted
	// to get rid of 'pointer' cursor when text is deleted
	const handleDelete = () => {
		originalHandleDelete();
		setHoveredId(null);
	};

	// Wrap handleEscape to clear hoveredId when text editing is cancelled
	const handleEscapeWrapper = () => {
		handleEscape();
		setHoveredId(null);
	};

	const scale = zoom / 100;

	const handleSelectShape = (shape: CanvasShape) => {
		if (isInteractiveCursor) {
			setSelectedShape(shape);
			setIsOpenSideDialog(true);
		}
	};

	// Combined mouse handlers
	const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
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
		if (!isPanning && !e.evt.shiftKey && e.evt.button === 0 && !hoveredId) {
			handleDrawStart(e);
		}
		// Navigation handling
		handleNavMouseDown(e);
	};

	// Text-specific mouse interactions
	const handleTextMouseDown = (e: KonvaEventObject<MouseEvent>) => {
		// Only handle text cursor logic for left clicks
		if (cursorType === CursorTypes.Text && e.evt.button === 0) {
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
				handleNavMouseDown(e);
			}
		} else {
			handleNavMouseDown(e);
		}
	};

	// Combined cursor logic that integrates drawing and our cursor system
	const getCombinedCursor = (e?: KonvaEventObject<MouseEvent>) => {
		// Drawing takes priority
		if (isDrawing) {
			return 'url("/cursors/draw_small.svg") 16 16, crosshair';
		}

		// Use our cursor logic for non-drawing states
		return getCursorFromHook();
	};

	const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
		// Handle drawing
		handleDrawMove(e);
		// Handle navigation
		handleNavMouseMove(e);
	};

	const handleMouseUp = (e: KonvaEventObject<MouseEvent>) => {
		handleDrawEnd();
		handleNavMouseUp(e);
	};

	return (
		<div
			ref={containerRef}
			className="relative flex h-full min-h-0 w-full flex-1 overflow-hidden"
		>
			{/* Top left corner */}
			<CursorPanel />

			{/* Top right corner */}
			<SidePanel />

			{/* Debug Panel */}
			<DebugSidePanel
				draftBounds={draftBounds}
				draftShape={draftShape}
				canChangeDirectionNow={canChangeDirectionNow}
				actualyChangingDirectionNow={actualyChangingDirectionNow}
				lastDirection={lastDirection}
				onDebugModeChange={setIsDebugMode}
			/>

			<Stage
				width={containerSize.width}
				height={containerSize.height}
				x={canvasPosition.x}
				y={canvasPosition.y}
				scaleX={scale}
				scaleY={scale}
				onWheel={handleWheel}
				// onMouseDown={handleCanvasMouseDown}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				style={{
					backgroundColor: "white",
					touchAction: "none",
					cursor: getCombinedCursor(),
				}}
			>
				<Layer>
					{displayShapes.map((shape) => {
						const flattenedPoints: number[] = [];
						for (const p of shape.points) {
							// Add shape origin to each point. Rotation is ignored for now.
							flattenedPoints.push(p.xPos + shape.xPos, p.yPos + shape.yPos);
						}

						const isSelected = shape.id === selectedShape?.id;
						const isHovered = shape.id === hoveredId && isInteractiveCursor;

						return (
							<Line
								key={shape.id}
								points={flattenedPoints}
								stroke={
									isSelected
										? "#2563EB" // selected blue
										: isHovered
											? "#374151" // hover light blue
											: "#9CA3AF" // default gray
								}
								fill={
									isSelected ? "#EFF6FF" : isHovered ? "#F3F4F6" : "transparent"
								}
								strokeWidth={2}
								closed
								listening={!isDrawing}
								onClick={() => !isDrawing && handleSelectShape(shape)}
								onMouseEnter={() => !isDrawing && setHoveredId(shape.id)}
								onMouseLeave={() => setHoveredId(null)}
							/>
						);
					})}

					{/* Draft rectangle preview */}
					{(() => {
						const draftBounds = getDraftBounds();
						if (!draftBounds) return null;

						return (
							<>
								<Line
									key="draft"
									points={draftBounds.flatMap((point) => [
										point.xPos,
										point.yPos,
									])}
									stroke="#2563EB"
									strokeWidth={2}
									dash={[5, 5]}
									listening={false}
									closed
								/>

								{/* Debug mode: Draw individual points in red */}
								{isDebugMode &&
									draftBounds.map((point) => (
										<Circle
											key={point.id}
											x={point.xPos}
											y={point.yPos}
											radius={5}
											fill="red"
											listening={false}
										/>
									))}

								{/* Debug mode: Draw direction change points in green */}
								{isDebugMode &&
									draftShape?.changedDirectionPoints.map((point) => (
										<Circle
											key={`direction-${point.xPos}-${point.yPos}`}
											x={point.xPos}
											y={point.yPos}
											radius={8}
											fill="green"
											stroke="darkgreen"
											strokeWidth={2}
											listening={false}
										/>
									))}
							</>
						);
					})()}

					{/* Render saved texts with optimistic updates */}
					{allTexts.map((t) =>
						editingText && editingText.id === t.id ? null : ( // hide the one being edited
							<Text
								key={t.id}
								x={t.xPos}
								y={t.yPos}
								text={t.text}
								fontSize={t.fontSize}
								fontStyle={`${t.isBold ? "bold" : ""} ${t.isItalic ? "italic" : ""}`}
								fill={t.textColor}
								onMouseEnter={() => setHoveredId(t.id)}
								onMouseLeave={() => setHoveredId(null)}
								onClick={() => setEditingText(t)}
								draggable
								onDragEnd={(e) => handleTextDragEnd(e, t)}
							/>
						),
					)}
				</Layer>
			</Stage>

			{/* Add text input */}
			{(newTextPos !== null || editingText !== null) && (
				<CanvasTextInput
					key={editingText?.id || `${currentTextPos.x}-${currentTextPos.y}`}
					position={currentTextPos}
					initialText={editingText}
					onSave={handleSave}
					onDelete={handleDelete}
					onEscape={handleEscapeWrapper}
				/>
			)}
		</div>
	);
};

export default DrawingCanvas;
