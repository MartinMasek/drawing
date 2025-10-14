import type { KonvaEventObject } from "konva/lib/Node";
import { useRouter } from "next/router";
import { useState } from "react";
import { Layer, Line, Stage } from "react-konva";
import { useShapeDrawing } from "~/hooks/useShapeDrawing";
import type { CanvasShape, Coordinate } from "~/types/drawing";
import { useCanvasNavigation } from "../hooks/useCanvasNavigation";
import { useCreateShape } from "../hooks/useCreateShape";
import CursorPanel from "./drawing-old/CursorPanel";
import DebugSidePanel from "./drawing-old/DebugSidePanel";
import DrawingPreview from "./canvasShapes/DrawingPreview";
import SidePanel from "./drawing-old/SidePanel";
import { useDrawing } from "./header/context/DrawingContext";
import { useShape } from "./header/context/ShapeContext";

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
		isPanning,
	} = useDrawing();
	const { selectedShape, setSelectedShape } = useShape();

	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const [dynamicCursor, setDynamicCursor] = useState<string>("default");
	const [isDebugMode, setIsDebugMode] = useState(false);

	// Shape mutations
	const createShapeMutation = useCreateShape(designId);
	// const updateShapeMutation = useUpdateShape(designId);

	const {
		handleWheel,
		handleMouseDown: handleNavMouseDown,
		handleMouseMove: handleNavMouseMove,
		handleMouseUp: handleNavMouseUp,
	} = useCanvasNavigation();

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
		getCursor,
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

	// Log draftBounds whenever it changes
	const previewBounds = getPreviewBounds();

	const scale = zoom / 100;

	const handleSelectShape = (shape: CanvasShape) => {
		setSelectedShape(shape);
		setIsOpenSideDialog(true);
	};

	// Combined mouse handlers
	const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
		// Drawing takes priority unless panning
		if (!isPanning && !e.evt.shiftKey && e.evt.button === 0 && !hoveredId) {
			handleDrawStart(e);
		}
		// Navigation handling
		handleNavMouseDown(e);
	};

	const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
		// Update cursor based on drawing state
		const cursor = getCursor();
		setDynamicCursor(cursor);

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
					cursor: isPanning
						? "grabbing"
						: isDrawing
							? "crosshair"
							: hoveredId
								? "pointer"
								: dynamicCursor,
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
						const isHovered = shape.id === hoveredId;

						return (
							<Line
								key={shape.id}
								points={flattenedPoints}
								stroke={
									isSelected
										? "#2563EB" // selected blue
										: isHovered
											? "#60A5FA" // hover light blue
											: "#111827" // default dark gray
								}
								fill={isSelected ? "#EFF6FF" : "transparent"}
								strokeWidth={2}
								closed
								listening={!isDrawing}
								onClick={() => !isDrawing && handleSelectShape(shape)}
								onMouseEnter={() => !isDrawing && setHoveredId(shape.id)}
								onMouseLeave={() => setHoveredId(null)}
							/>
						);
					})}

				<DrawingPreview
					bounds={previewBounds}
					directionChangingPoints={previewShape?.changedDirectionPoints}
					isDebugMode={isDebugMode}
				/>
				</Layer>
			</Stage>
		</div>
	);
};

export default DrawingCanvas;
