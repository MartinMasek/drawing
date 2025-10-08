import { Layer, Line, Stage } from "react-konva";
import type { CanvasShape } from "~/types/drawing";
import CursorPanel from "./drawing-old/CursorPanel";
import SidePanel from "./drawing-old/SidePanel";
import { useCanvasNavigation } from "./drawing-old/hooks/useCanvasNavigation";
import { useDrawing } from "./header/context/DrawingContext";
import { useShape } from "./header/context/ShapeContext";
import { useEffect, useState } from "react";

interface DrawingCanvasProps {
	shapes?: ReadonlyArray<CanvasShape>;
}

const DrawingCanvas = ({ shapes = [] }: DrawingCanvasProps) => {
	const { containerSize, containerRef, canvasPosition, zoom } = useDrawing();
	const { selectedShape, setSelectedShape, setAllShapes } = useShape();

	const [hoveredId, setHoveredId] = useState<string | null>(null);

	const { handleWheel, handleMouseDown, handleMouseMove, handleMouseUp } =
		useCanvasNavigation();

	const scale = zoom / 100;


	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (shapes.length) {
			setAllShapes(
				shapes.map((canvasShape) => ({
				id: canvasShape.id,
				area: 22,
				}))
			);
		}
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
					cursor: hoveredId ? "pointer" : "default",
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
								listening={true}
								onClick={(e) => setSelectedShape({id: shape.id, area: 0})}
								onMouseEnter={() => setHoveredId(shape.id)}
                				onMouseLeave={() => setHoveredId(null)}
							/>
						);
					})}
				</Layer>
			</Stage>
		</div>
	);
};

export default DrawingCanvas;
