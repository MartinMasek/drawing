import type { Coordinate } from "~/types/drawing";
import EdgeMeasurement from "./EdgeMeasurement";

interface ShapeEdgeMeasurementsProps {
	points: ReadonlyArray<Coordinate>;
}

/**
 * Renders edge measurements for a complete shape
 */
const ShapeEdgeMeasurements = ({ points }: ShapeEdgeMeasurementsProps) => {
	if (points.length < 2) return null;

	// compute current X width of the shape (maxX - minX)
	const xs = points.map((p) => p.xPos);
	const minX = Math.min(...xs);
	const maxX = Math.max(...xs);
	const xWidth = maxX - minX;

	const edges: {
		startPoint: Coordinate;
		endPoint: Coordinate;
		length: number;
	}[] = [];

	for (let i = 0; i < points.length; i++) {
		const startPoint = points[i];
		const endPoint = points[(i + 1) % points.length]; // wrap to first point

		const dx = (endPoint?.xPos ?? 0) - (startPoint?.xPos ?? 0);
		const dy = (endPoint?.yPos ?? 0) - (startPoint?.yPos ?? 0);
		const length = Math.sqrt(dx * dx + dy * dy);

		const isVertical = Math.abs(dx) < Math.abs(dy);
		// Only display vertical (Y-axis) measurements when X-axis width > 1
		if (isVertical && xWidth <= 1) {
			continue; // skip adding this edge measurement
		}

		edges.push({
			startPoint: startPoint ?? { xPos: 0, yPos: 0 },
			endPoint: endPoint ?? { xPos: 0, yPos: 0 },
			length,
		});
	}

	return (
		<>
			{edges.map((edge) => (
				<EdgeMeasurement
					key={`edge-${edge.startPoint?.xPos}-${edge.startPoint?.yPos}-${edge.endPoint?.xPos}-${edge.endPoint?.yPos}`}
					startPoint={edge.startPoint ?? { xPos: 0, yPos: 0 }}
					endPoint={edge.endPoint ?? { xPos: 0, yPos: 0 }}
					length={edge.length}
				/>
			))}
		</>
	);
};

export default ShapeEdgeMeasurements;
