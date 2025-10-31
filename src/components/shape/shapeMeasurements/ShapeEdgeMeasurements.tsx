import type { CanvasShape, Coordinate } from "~/types/drawing";
import { EdgeModificationType } from "@prisma/client";
import EdgeMeasurement from "./EdgeMeasurement";

interface ShapeEdgeMeasurementsProps {
	points: ReadonlyArray<Coordinate>;
	scale: number;
	shape?: CanvasShape; // Used to calculate additional offset for edge modifications (for example when we have bump out we need to add extra space to avoid overlapping with the edge). Optional because we can use it for preview mode
}

/**
 * Calculate additional offset needed for edge modifications
 * Returns the depth of the modification to avoid overlap with measurements
 */
const calculateEdgeOffset = (
	shape: CanvasShape,
	pointIndex: number,
): number => {
	// Find the edge that starts at this point
	const edge = shape.edges.find(
		(e) =>
			e.point1Id === shape.points[pointIndex]?.id &&
			e.point2Id === shape.points[(pointIndex + 1) % shape.points.length]?.id,
	);

	if (!edge || edge.edgeModifications.length === 0) {
		return 0;
	}

	// Find the maximum depth from all modifications on this edge
	let maxDepth = 0;
	for (const mod of edge.edgeModifications) {
		const depth = mod.depth ?? 0;
		const fullRadiusDepth = mod.fullRadiusDepth ?? 0;

		// Only consider bump-outs and curves (not bump-ins)
		if (
			mod.type === EdgeModificationType.BumpOut ||
			mod.type === EdgeModificationType.BumpOutCurve ||
			mod.type === EdgeModificationType.FullCurve
		) {
			maxDepth = Math.max(maxDepth, depth, fullRadiusDepth);
		}
	}

	// Add extra spacing (10 pixels) to ensure measurement is clearly separated
	return maxDepth > 0 ? maxDepth + 10 : 0;
};

/**
 * Renders edge measurements for a complete shape
 * Automatically adjusts offset to avoid overlapping with edge modifications
 */
const ShapeEdgeMeasurements = ({
	points,
	scale,
	shape,
}: ShapeEdgeMeasurementsProps) => {
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
		additionalOffset: number;
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

		// Calculate additional offset for edge modifications
		const additionalOffset = shape ? calculateEdgeOffset(shape, i) : 0;

		edges.push({
			startPoint: startPoint ?? { xPos: 0, yPos: 0 },
			endPoint: endPoint ?? { xPos: 0, yPos: 0 },
			length,
			additionalOffset,
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
					scale={scale}
					additionalOffset={edge.additionalOffset}
				/>
			))}
		</>
	);
};

export default ShapeEdgeMeasurements;
