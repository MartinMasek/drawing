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

	// Create edges by connecting consecutive points
	const edges = [];
	for (let i = 0; i < points.length; i++) {
		const startPoint = points[i];
		const endPoint = points[(i + 1) % points.length]; // Wrap to first point for last edge

		// Calculate edge length
		const dx = (endPoint?.xPos ?? 0) - (startPoint?.xPos ?? 0);
		const dy = (endPoint?.yPos ?? 0) - (startPoint?.yPos ?? 0);
		const length = Math.sqrt(dx * dx + dy * dy);

		edges.push({
			startPoint,
			endPoint,
			length,
		});
	}

	return (
		<>
			{edges.map((edge, index) => (
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
