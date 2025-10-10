import { useState } from "react";
import { Layer, Line, Stage, Text } from "react-konva";
import type { CanvasShape, CanvasText, CanvasTextData } from "~/types/drawing";
import CursorPanel from "./drawing-old/CursorPanel";
import SidePanel from "./drawing-old/SidePanel";
import { useCanvasNavigation } from "./drawing-old/hooks/useCanvasNavigation";
import { useDrawing } from "./header/context/DrawingContext";
import { useShape } from "./header/context/ShapeContext";
import { CursorTypes } from "./header/header/drawing-types";
import { api } from "~/utils/api";
import CanvasTextInput from "./canvasTextInput/CanvasTextInput";
import type { KonvaEventObject } from "konva/lib/Node";
import { useText } from "./drawing-old/hooks/useText";

interface DrawingCanvasProps {
	shapes?: ReadonlyArray<CanvasShape>;
	texts?: CanvasText[];
	designId: string;
}

const DrawingCanvas = ({
	shapes = [],
	texts = [],
	designId,
}: DrawingCanvasProps) => {
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
		handleDelete,
		handleEscape,
		handleTextDragEnd,
		currentTextPos,
		setNewTextPos,
	} = useText(designId);

	const scale = zoom / 100;

	// Cursor types
	const isCursorDimesions = cursorType === CursorTypes.Dimesions;
	const isCursorCurves = cursorType === CursorTypes.Curves;
	const isCursorCorners = cursorType === CursorTypes.Corners;
	const isCursorEdges = cursorType === CursorTypes.Egdes;
	const isCursorText = cursorType === CursorTypes.Text;
	const isCursorSelect = cursorType === CursorTypes.Select;

	const handleSelectShape = (shape: CanvasShape) => {
		if (
			isCursorDimesions ||
			isCursorCurves ||
			isCursorCorners ||
			isCursorEdges
		) {
			setSelectedShape(shape);
			setIsOpenSideDialog(true);
		}
	};

	const handleCursor = () => {
		if (isPanning) return "grabbing";
		if (isCursorText) return "text";
		if (isCursorSelect) return "crosshair";

		if (isCursorDimesions && !hoveredId) {
			return 'url("/cursors/pencil.svg") 0 0, crosshair';
		}

		if (
			hoveredId &&
			(isCursorDimesions || isCursorCurves || isCursorCorners || isCursorEdges)
		)
			return "pointer";

		return "default";
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
				// onMouseDown={handleMouseDown}
				onMouseDown={(e) => {
					if (isCursorText) {
						const stage = e.target.getStage();
						const pointerPosition = stage?.getPointerPosition();
						if (pointerPosition && newTextPos === null) {
							setNewTextPos(pointerPosition);
						} else {
							setNewTextPos(null);
						}
					} else {
						handleMouseDown(e);
					}
				}}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				style={{
					backgroundColor: "white",
					touchAction: "none",
					cursor: handleCursor(),
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
						const isHovered =
							shape.id === hoveredId &&
							(isCursorDimesions ||
								isCursorCurves ||
								isCursorCorners ||
								isCursorEdges);

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

					{/* Render saved texts */}
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
					onSave={handleSave}
					onDelete={handleDelete}
					onBlur={() => {}}
					onEscape={handleEscape}
				/>
			)}
		</div>
	);
};

export default DrawingCanvas;
