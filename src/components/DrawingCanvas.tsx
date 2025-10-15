import type { KonvaEventObject } from "konva/lib/Node";
import { useRouter } from "next/router";
import { useState } from "react";
import { Layer, Stage, Text } from "react-konva";
import { useShapeDrawing } from "~/hooks/useShapeDrawing";
import type {
	CanvasShape,
	Coordinate,
	CanvasText,
	CanvasTextData,
} from "~/types/drawing";
import { useCreateShape } from "../hooks/mutations/useCreateShape";
import { useMouseInteractions } from "../hooks/useMouseInteractions";
import { useText } from "../hooks/useText";
import CursorPanel from "./CursorPanel";
import DebugSidePanel from "./DebugSidePanel";
import DrawingPreview from "./canvasShapes/DrawingPreview";
import Shape from "./canvasShapes/Shape";
import SidePanel from "./SidePanel";
import { useDrawing } from "./header/context/DrawingContext";
import { useShape } from "./header/context/ShapeContext";
import CanvasTextInput from "./canvasTextInput/CanvasTextInput";

interface DrawingCanvasProps {
	shapes?: ReadonlyArray<CanvasShape>;
	texts?: ReadonlyArray<CanvasText>;
}

const DrawingCanvas = ({ shapes = [], texts = [] }: DrawingCanvasProps) => {
	const router = useRouter();
	const idParam = router.query.id;
	const designId = Array.isArray(idParam) ? idParam[0] : idParam;

	const { selectedShape, setSelectedShape } = useShape();
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const [isDebugMode, setIsDebugMode] = useState(false);

	const {
		containerSize,
		containerRef,
		canvasPosition,
		zoom,
		setIsOpenSideDialog,
		cursorType,
		isPanning,
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

	// Shape mutations
	const createShapeMutation = useCreateShape(designId);
	// const updateShapeMutation = useUpdateShape(designId);

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
	} = useShapeDrawing(
		zoom,
		canvasPosition,
		handleShapeComplete,
		// handleShapeUpdate,
		// handleShapeUpdateComplete,
	);

	const handleSelectShape = (shape: CanvasShape) => {
		if (isInteractiveCursor) {
			setSelectedShape(shape);
			setIsOpenSideDialog(true);
		}
	};

	// Mouse interactions
	const {
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		handleWheel,
		getCombinedCursor,
		isInteractiveCursor,
	} = useMouseInteractions({
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
	});

	// Log draftBounds whenever it changes
	const previewBounds = getPreviewBounds();

	const scale = zoom / 100;

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
				style={{
					backgroundColor: "white",
					touchAction: "none",
					cursor: getCombinedCursor(),
				}}
			>
				<Layer>
					{shapes.map((shape) => {
						const isSelected = shape.id === selectedShape?.id;
						const isHovered = shape.id === hoveredId && isInteractiveCursor;

						return (
							<Shape
								key={shape.id}
								shape={shape}
								isSelected={isSelected}
								isHovered={isHovered}
								isDrawing={isDrawing}
								onClick={() => handleSelectShape(shape)}
								onMouseEnter={() => setHoveredId(shape.id)}
								onMouseLeave={() => setHoveredId(null)}
							/>
						);
					})}

					<DrawingPreview
						bounds={previewBounds}
						directionChangingPoints={previewShape?.changedDirectionPoints}
						isDebugMode={isDebugMode}
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
		</div>
	);
};

export default DrawingCanvas;
