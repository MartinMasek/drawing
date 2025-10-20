import { Circle, Line } from "react-konva";
import type { Coordinate } from "~/types/drawing";
import ShapeEdgeMeasurements from "./ShapeEdgeMeasurements";

type DrawingPreviewProps = {
	bounds: Coordinate[] | null;
	directionChangingPoints?: Coordinate[];
	isDebugMode: boolean;
	scale: number;
};

/**
 * Renders the draft shape preview while drawing,
 * including debug visualizations for points and direction changes.
 */
const DrawingPreview = ({
	bounds,
	directionChangingPoints,
	isDebugMode,
	scale,
}: DrawingPreviewProps) => {
	if (!bounds) return null;

	return (
		<>
			<Line
				key="draft"
				points={bounds.flatMap((point) => [point.xPos, point.yPos])}
				stroke="#2563EB"
				strokeWidth={2}
				dash={[5, 5]}
				listening={false}
				closed
			/>

			{/* Debug mode: Draw individual points in red */}
			{isDebugMode &&
				bounds.map((point) => (
					<Circle
						key={`point-${point.xPos}-${point.yPos}`}
						x={point.xPos}
						y={point.yPos}
						radius={5}
						fill="red"
						listening={false}
					/>
				))}

			{/* Debug mode: Draw direction change points in green */}
			{isDebugMode &&
				directionChangingPoints?.map((point) => (
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

			{/* Edge measurements for the preview shape */}
			<ShapeEdgeMeasurements points={bounds} scale={scale} />
		</>
	);
};

export default DrawingPreview;
