import { useState } from "react";
import { Layer, Line, Stage, Text } from "react-konva";
import type { CanvasShape } from "~/types/drawing";
import CursorPanel from "./drawing-old/CursorPanel";
import SidePanel from "./drawing-old/SidePanel";
import { useCanvasNavigation } from "./drawing-old/hooks/useCanvasNavigation";
import { useCursorLogic } from "./drawing-old/hooks/useCursorLogic";
import { useMouseInteractions } from "./drawing-old/hooks/useMouseInteractions";
import { useDrawing } from "./header/context/DrawingContext";
import { useShape } from "./header/context/ShapeContext";
import CanvasTextInput from "./canvasTextInput/CanvasTextInput";
import { useText } from "./drawing-old/hooks/useText";

interface DrawingCanvasProps {
	shapes?: ReadonlyArray<CanvasShape>;
	designId: string;
}

const DrawingCanvas = ({ shapes = [], designId }: DrawingCanvasProps) => {
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

	const { handleWheel, handleMouseDown, handleMouseMove, handleMouseUp } =
		useCanvasNavigation();

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
	const { isInteractiveCursor, getCursor } = useCursorLogic({
		cursorType,
		hoveredId,
		isPanning,
		allTexts,
	});

	// Mouse interactions
	const { handleCanvasMouseDown } = useMouseInteractions({
		cursorType,
		hoveredId,
		allTexts,
		newTextPos,
		setNewTextPos,
		handleMouseDown,
	});

	// Wrap handleDelete to clear hoveredId when text is deleted
	// to get rid of 'pointer' cursor when text is deleted
	const handleDelete = () => {
		originalHandleDelete();
		setHoveredId(null);
	};

	const scale = zoom / 100;

	const handleSelectShape = (shape: CanvasShape) => {
		if (isInteractiveCursor) {
			setSelectedShape(shape);
			setIsOpenSideDialog(true);
		}
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

			<Stage
				width={containerSize.width}
				height={containerSize.height}
				x={canvasPosition.x}
				y={canvasPosition.y}
				scaleX={scale}
				scaleY={scale}
				onWheel={handleWheel}
				onMouseDown={handleCanvasMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				style={{
					backgroundColor: "white",
					touchAction: "none",
					cursor: getCursor(),
				}}
			>
				<Layer>
					{shapes.map((shape) => {
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
								listening={true}
								onClick={() => handleSelectShape(shape)}
								onMouseEnter={() => setHoveredId(shape.id)}
								onMouseLeave={() => setHoveredId(null)}
							/>
						);
					})}

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
					onEscape={handleEscape}
				/>
			)}
		</div>
	);
};

export default DrawingCanvas;
