import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { Layer, Stage, Text } from "react-konva";
import { useShapeDrawing } from "~/hooks/useShapeDrawing";
import type {
	CanvasShape,
	Coordinate,
	CanvasText,
	CanvasTextData,
} from "~/types/drawing";
import { getTotalAreaOfShapes } from "~/utils/ui-utils";
import { useCreateShape, isTempShapeId, registerPendingUpdate } from "../hooks/mutations/useCreateShape";
import { useUpdateShape } from "../hooks/mutations/useUpdateShape";
import { useMouseInteractions } from "../hooks/useMouseInteractions";
import { useText } from "../hooks/useText";
import { api } from "~/utils/api";
import CursorPanel from "./CursorPanel";
import DebugSidePanel from "./DebugSidePanel";
import DrawingPreview from "./canvasShapes/DrawingPreview";
import Shape from "./canvasShapes/Shape";
import ShapeContextMenu from "./canvasShapes/ShapeContextMenu";
import SidePanel from "./SidePanel";
import { useDrawing } from "./header/context/DrawingContext";
import { useShape } from "./header/context/ShapeContext";
import CanvasTextInput from "./canvasTextInput/CanvasTextInput";
import type { KonvaEventObject } from "konva/lib/Node";
import { DrawingTab } from "./header/header/drawing-types";

interface DrawingCanvasProps {
	shapes?: ReadonlyArray<CanvasShape>;
	texts?: ReadonlyArray<CanvasText>;
}

const DrawingCanvas = ({ shapes = [], texts = [] }: DrawingCanvasProps) => {
	const router = useRouter();
	const idParam = router.query.id;
	const designId = Array.isArray(idParam) ? idParam[0] : idParam;

	const { selectedShape, setSelectedShape, setSelectedEdge, setSelectedCorner } =
		useShape();
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const [draggingId, setDraggingId] = useState<string | null>(null);
	const [isDebugMode, setIsDebugMode] = useState(false);
	const [contextMenu, setContextMenu] = useState<{
		shapeId: string;
		x: number;
		y: number;
	} | null>(null);

	const {
		containerSize,
		containerRef,
		canvasPosition,
		zoom,
		setIsOpenSideDialog,
		cursorType,
		isPanning,
		setTotalArea,
		activeTab,
	} = useDrawing();

	// Text handling
	const {
		editingText,
		setEditingText,
		newTextPos,
		setNewTextPos,
		currentTextPos,
		handleSave,
		handleDelete,
		handleEscape,
		handleTextDragEnd,
	} = useText(designId ?? "");

	// Calculate total area when shapes are loaded
	useEffect(() => {
		if (shapes && shapes.length > 0) {
			const totalArea = getTotalAreaOfShapes(shapes as CanvasShape[]).toFixed(
				2,
			);
			setTotalArea(Number(totalArea));
		} else {
			setTotalArea(0);
		}
	}, [shapes, setTotalArea]);

	// Shape mutations and utils
	const utils = api.useUtils();
	const createShapeMutation = useCreateShape(designId);
	const updateShapeMutation = useUpdateShape(designId);

	const handleShapeComplete = (shape: {
		xPos: number;
		yPos: number;
		points: Coordinate[];
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

	const {
		handleDrawStart,
		handleDrawMove,
		handleDrawEnd,
		getPreviewBounds,
		isDrawing,
		previewShape,
		canChangeDirectionNow,
		lastDirection,
		rawCursorPosition,
	} = useShapeDrawing(
		zoom,
		canvasPosition,
		handleShapeComplete,
		// handleShapeUpdate,
		// handleShapeUpdateComplete,
	);

	const handleSelectShape = (shape: CanvasShape, e: KonvaEventObject<MouseEvent>) => {
		if (isInteractiveCursor) {
			setSelectedShape(shape);
			setIsOpenSideDialog(true);

			// Open context menu on left click as well
			setContextMenu({
				shapeId: shape.id,
				x: e.evt.clientX,
				y: e.evt.clientY,
			});
		}
	};

	const handleShapeDragStart = (shape: CanvasShape) => {
		setDraggingId(shape.id);

		if (!designId) return;

		// Move the dragged shape to the end of the array (on top of others)
		// This makes it stay on top even after drag ends
		const currentData = utils.design.getById.getData({ id: designId });
		if (currentData) {
			const otherShapes = currentData.shapes.filter((s) => s.id !== shape.id);
			const draggedShape = currentData.shapes.find((s) => s.id === shape.id);

			if (draggedShape) {
				utils.design.getById.setData(
					{ id: designId },
					{
						...currentData,
						shapes: [...otherShapes, draggedShape],
					},
				);
			}
		}
	};

	const handleShapeDragMove = (
		shape: CanvasShape,
		newX: number,
		newY: number,
	) => {
		if (!designId) return;

		// For shapes with temp IDs, continuously update cache position during drag
		// Why: When createShape completes, the cache gets updated with the real ID.
		// By keeping the cached position in sync with drag position, the shape appears
		// in the correct location after the temp->real ID transition (no visual jump).
		if (isTempShapeId(shape.id)) {
			const currentData = utils.design.getById.getData({ id: designId });
			if (currentData) {
				utils.design.getById.setData(
					{ id: designId },
					{
						...currentData,
						shapes: currentData.shapes.map((s) =>
							s.id === shape.id
								? { ...s, xPos: newX, yPos: newY }
								: s,
						),
					},
				);
			}
		}
	};

	const handleShapeDragEnd = (
		shape: CanvasShape,
		newX: number,
		newY: number,
	) => {
		setDraggingId(null);

		if (!designId) return;

		// If shape has temp ID, register pending update instead of calling server
		if (isTempShapeId(shape.id)) {
			registerPendingUpdate(shape.id, {
				xPos: newX,
				yPos: newY,
				points: shape.points.map((point) => ({
					id: point.id,
					xPos: point.xPos,
					yPos: point.yPos,
				})),
			});

			// Update the cache optimistically (final position)
			const currentData = utils.design.getById.getData({ id: designId });
			if (currentData) {
				utils.design.getById.setData(
					{ id: designId },
					{
						...currentData,
						shapes: currentData.shapes.map((s) =>
							s.id === shape.id
								? { ...s, xPos: newX, yPos: newY }
								: s,
						),
					},
				);
			}
			return;
		}

		updateShapeMutation.mutate({
			shapeId: shape.id,
			xPos: newX,
			yPos: newY,
			points: [...shape.points],
		});
	};

	const handleShapeContextMenu = (
		shape: CanvasShape,
		e: KonvaEventObject<PointerEvent>,
	) => {
		e.evt.preventDefault();

		// Use client coordinates (screen position) for context menu
		// This ensures the menu appears at the cursor regardless of zoom/pan
		setContextMenu({
			shapeId: shape.id,
			x: e.evt.clientX,
			y: e.evt.clientY,
		});
	};

	const handleShapeDeleted = (shapeId: string) => {
		// Clear selected shape if it's the one being deleted
		setSelectedShape(null);
		setSelectedEdge(null);
		setSelectedCorner(null);
		setIsOpenSideDialog(false);
	};

	const handleCloseContextMenu = () => {
		setContextMenu(null);
	};

	const handleStageContextMenu = (e: KonvaEventObject<PointerEvent>) => {
		// Prevent default browser context menu when right-clicking on empty canvas
		if (e.target === e.target.getStage()) {
			e.evt.preventDefault();
		}
	};

	// Mouse interactions
	const {
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		handleWheel,
		getCursorFromHook,
		isInteractiveCursor,
	} = useMouseInteractions({
		cursorType,
		hoveredId,
		setHoveredId,
		texts,
		isPanning,
		isDragging: !!draggingId,
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
		drawingTab: activeTab,
		closeContextMenu: handleCloseContextMenu,
	});

	// Log draftBounds whenever it changes
	const previewBounds = getPreviewBounds();

	const scale = zoom / 100;

	// Sort shapes to render interactive ones on top
	// Order: normal shapes -> hovered -> selected/context menu -> dragging
	const sortedShapes = useMemo(() => {
		const shapesArray = [...shapes];
		return shapesArray.sort((a, b) => {
			const aIsDragging = a.id === draggingId;
			const bIsDragging = b.id === draggingId;
			const aIsSelected = a.id === selectedShape?.id || a.id === contextMenu?.shapeId;
			const bIsSelected = b.id === selectedShape?.id || b.id === contextMenu?.shapeId;
			const aIsHovered = a.id === hoveredId;
			const bIsHovered = b.id === hoveredId;

			// Dragging shapes always on top
			if (aIsDragging && !bIsDragging) return 1;
			if (!aIsDragging && bIsDragging) return -1;

			// Selected/context menu shapes next
			if (aIsSelected && !bIsSelected) return 1;
			if (!aIsSelected && bIsSelected) return -1;

			// Hovered shapes next
			if (aIsHovered && !bIsHovered) return 1;
			if (!aIsHovered && bIsHovered) return -1;

			// Maintain original order for others
			return 0;
		});
	}, [shapes, draggingId, selectedShape?.id, contextMenu?.shapeId, hoveredId]);

	// Wrapper functions for text operations that clear hover state
	const handleEscapeTextWrapper = () => {
		handleEscape();
		setHoveredId(null);
	};

	const handleSaveTextWrapper = (textData: CanvasTextData) => {
		handleSave(textData);
		setHoveredId(null);
	};

	const handleDeleteTextWrapper = () => {
		handleDelete();
		setHoveredId(null);
	};

	const allModifications = useMemo(() => {
		return shapes.flatMap((shape) => shape.edges.flatMap((edge) => edge.edgeModifications));
	}, [shapes]);

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
				previewBounds={previewBounds}
				previewShape={previewShape}
				canChangeDirectionNow={canChangeDirectionNow}
				lastDirection={lastDirection}
				onDebugModeChange={setIsDebugMode}
				allModifications={allModifications}
			/>

			<Stage
				width={containerSize.width}
				height={containerSize.height}
				x={canvasPosition.x}
				y={canvasPosition.y}
				scaleX={scale}
				scaleY={scale}
				onWheel={handleWheel}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onContextMenu={handleStageContextMenu}
				style={{
					backgroundColor: "white",
					touchAction: "none",
					cursor: getCursorFromHook(),
				}}
			>
				<Layer>
					{sortedShapes.map((shape) => {
						const isSelected = shape.id === selectedShape?.id;
						const isHovered = shape.id === hoveredId && isInteractiveCursor;
						const hasContextMenuOpen = contextMenu?.shapeId === shape.id;

						return (
							<Shape
								// Use clientId as key to prevent remounting when temp ID becomes real ID
								// Falls back to shape.id for shapes loaded from database (which don't have clientId)
								key={shape.clientId || shape.id}
								shape={shape}
								isSelected={isSelected || hasContextMenuOpen}
								isHovered={isHovered}
								isDrawing={isDrawing}
								isDraggable={isInteractiveCursor}
								onClick={(e) => handleSelectShape(shape, e)}
								onMouseEnter={() => setHoveredId(shape.id)}
								onMouseLeave={() => setHoveredId(null)}
								onDragStart={() => handleShapeDragStart(shape)}
								onDragMove={(newX, newY) =>
									handleShapeDragMove(shape, newX, newY)
								}
								onDragEnd={(newX, newY) =>
									handleShapeDragEnd(shape, newX, newY)
								}
								onContextMenu={(e) => handleShapeContextMenu(shape, e)}
								activeTab={activeTab}
								isDebugMode={isDebugMode}
								scale={scale}
							/>
						);
					})}

					<DrawingPreview
						bounds={previewBounds}
						directionChangingPoints={previewShape?.changedDirectionPoints}
						isDebugMode={isDebugMode}
						scale={scale}
						cursorPosition={rawCursorPosition}
						currentDirection={previewShape?.direction}
						canChangeDirection={canChangeDirectionNow}
						lastDirection={lastDirection}
					/>

					{/* Render saved texts with optimistic updates */}
					{texts.map((t) =>
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
					onSave={handleSaveTextWrapper}
					onDelete={handleDeleteTextWrapper}
					onEscape={handleEscapeTextWrapper}
				/>
			)}

			{/* Context menu for shapes */}
			{contextMenu &&
				designId &&
				(() => {
					const shape = shapes.find((s) => s.id === contextMenu.shapeId);

					if (!shape || activeTab !== DrawingTab.Dimensions) return null;

					return (
						<ShapeContextMenu
							x={contextMenu.x}
							y={contextMenu.y}
							shape={shape}
							designId={designId}
							selectedShapeId={selectedShape?.id ?? null}
							onShapeDeleted={handleShapeDeleted}
							onClose={handleCloseContextMenu}
						/>
					);
				})()}
		</div>
	);
};

export default DrawingCanvas;
