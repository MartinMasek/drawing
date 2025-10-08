import { Layer, Line, Stage } from "react-konva";
import type { CanvasShape } from "~/types/drawing";
import CursorPanel from "./drawing-old/CursorPanel";
import SidePanel from "./drawing-old/SidePanel";
import { useCanvasNavigation } from "./drawing-old/hooks/useCanvasNavigation";
import { useDrawing } from "./header/context/DrawingContext";

interface DrawingCanvasProps {
	shapes?: ReadonlyArray<CanvasShape>;
}

const DrawingCanvas = ({ shapes = [] }: DrawingCanvasProps) => {
	const { containerSize, containerRef, canvasPosition, zoom } = useDrawing();

	const { handleWheel, handleMouseDown, handleMouseMove, handleMouseUp } =
		useCanvasNavigation();

	const scale = zoom / 100;

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
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				style={{
					backgroundColor: "white",
					touchAction: "none",
				}}
			>
				<Layer>
					{shapes.map((shape) => {
						const flattenedPoints: number[] = [];
						for (const p of shape.points) {
							// Add shape origin to each point. Rotation is ignored for now.
							flattenedPoints.push(p.xPos + shape.xPos, p.yPos + shape.yPos);
						}
						return (
							<Line
								key={shape.id}
								points={flattenedPoints}
								stroke="#111827"
								strokeWidth={2}
								closed
								listening={false}
							/>
						);
					})}
				</Layer>
			</Stage>
		</div>
	);
};

export default DrawingCanvas;
