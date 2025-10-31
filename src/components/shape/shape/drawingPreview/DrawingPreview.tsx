import { Circle, Line, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { CardinalDirection, type Coordinate, type DrawingAxis } from "~/types/drawing";
import ShapeEdgeMeasurements from "../../shapeMeasurements/ShapeEdgeMeasurements";
import { SHAPE_DRAWING_DRAGGED_EDGE_COLOR, SHAPE_DRAWING_FILL_COLOR, SHAPE_DRAWING_OUTLINE_COLOR } from "~/utils/canvas-constants";

type DrawingPreviewProps = {
	bounds: Coordinate[] | null;
	directionChangingPoints?: Coordinate[];
	isDebugMode: boolean;
	scale: number;
	cursorPosition?: { x: number; y: number } | null;
	currentDirection?: DrawingAxis;
	canChangeDirection?: boolean;
	lastLength?: number;
	lastDirection?: CardinalDirection | null;
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
	cursorPosition,
	canChangeDirection,
	lastDirection,
}: DrawingPreviewProps) => {
	// Load all cursor images upfront
	const [oneDirImage] = useImage("/cursors/draw_directions/one_direction.svg");
	const [twoDirImage] = useImage("/cursors/draw_directions/two_directions.svg");
	const [threeDirImage] = useImage("/cursors/draw_directions/three_directions.svg");

	const getCursorImage = () => {
		if (canChangeDirection) {
			return threeDirImage;
		}

		return oneDirImage;
	};

	const cursorImage = getCursorImage();

	// Calculate proper offset and rotation for each cursor based on cardinal direction
	const getCursorOffset = () => {
		const image = cursorImage;
		if (!image) return { offsetX: 0, offsetY: 0, rotation: 0 };

		// Get actual image dimensions
		const width = image.width;
		const height = image.height;

		// One direction cursor: points down by default, rotate based on cardinal direction
		if (image === oneDirImage && lastDirection) {
			let rotation = 0;
			switch (lastDirection) {
				case CardinalDirection.Down:
					rotation = 0; // Default orientation
					break;
				case CardinalDirection.Right:
					rotation = -90; // Rotate counter-clockwise to point right
					break;
				case CardinalDirection.Up:
					rotation = 180; // Rotate to point up
					break;
				case CardinalDirection.Left:
					rotation = 90; // Rotate clockwise to point left
					break;
			}
			return {
				offsetX: width / 2,
				offsetY: height / 2,
				rotation,
			};
		}

		// Three direction cursor: points right by default, rotate based on cardinal direction
		if (image === threeDirImage && lastDirection) {
			let rotation = 0;
			switch (lastDirection) {
				case CardinalDirection.Right:
					rotation = 0; // Default orientation (pointing right)
					break;
				case CardinalDirection.Down:
					rotation = 90; // Rotate clockwise to point down
					break;
				case CardinalDirection.Left:
					rotation = 180; // Rotate to point left
					break;
				case CardinalDirection.Up:
					rotation = -90; // Rotate counter-clockwise to point up
					break;
			}
			return {
				offsetX: width / 2,
				offsetY: height / 2,
				rotation,
			};
		}

		// For all other cursors (or no direction yet), center normally
		return {
			offsetX: width / 2,
			offsetY: height / 2,
			rotation: 0,
		};
	};

	const cursorOffset = getCursorOffset();

	// Extract the active edge being drawn from bounds (the end cap points)
	// Bounds structure: [startCap(2), outerPoints(n), endCap(2), innerPoints(n)]
	// where n = directionChangingPoints.length
	const getActiveEdge = (): Coordinate[] | null => {
		if (!bounds) return null;

		const numDirectionChanges = directionChangingPoints?.length ?? 0;
		
		// End cap starts at index: 2 (start cap) + numDirectionChanges (outer points)
		const endCapStartIndex = 2 + numDirectionChanges;
		
		// End cap consists of 2 points
		const endCapPoint1 = bounds[endCapStartIndex];
		const endCapPoint2 = bounds[endCapStartIndex + 1];
		
		if (!endCapPoint1 || !endCapPoint2) return null;
		
		return [endCapPoint1, endCapPoint2];
	};

	const activeEdge = getActiveEdge();

	if (!bounds) return null;

	return (
		<>
			<Line
				key="draft"
				points={bounds.flatMap((point) => [point.xPos, point.yPos])}
				stroke={SHAPE_DRAWING_OUTLINE_COLOR}
				fill={SHAPE_DRAWING_FILL_COLOR}
				strokeWidth={2}
				listening={false}
				closed
			/>

			{/* Highlight the currently active edge being drawn (perpendicular cap) */}
			{activeEdge && activeEdge.length === 2 && activeEdge[0] && activeEdge[1] && (
				<Line
					key="active-edge"
					points={[
						activeEdge[0].xPos,
						activeEdge[0].yPos,
						activeEdge[1].xPos,
						activeEdge[1].yPos,
					]}
					stroke={SHAPE_DRAWING_DRAGGED_EDGE_COLOR}
					strokeWidth={4}
					listening={false}
				/>
			)}

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

			{/* Render cursor at current drawing position */}
			{cursorPosition && cursorImage && (
				<KonvaImage
					image={cursorImage}
					x={cursorPosition.x}
					y={cursorPosition.y}
					listening={false}
					opacity={0.8}
					rotation={cursorOffset.rotation}
					offsetX={cursorOffset.offsetX}
					offsetY={cursorOffset.offsetY}
				/>
			)}
		</>
	);
};

export default DrawingPreview;
