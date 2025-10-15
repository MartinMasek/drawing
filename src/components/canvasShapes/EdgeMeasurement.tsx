import { Group, Line, Rect, Text } from "react-konva";
import type { Coordinate } from "~/types/drawing";

interface EdgeMeasurementProps {
	startPoint: Coordinate;
	endPoint: Coordinate;
	length: number;
}

/**
 * Renders a double-sided arrow with length measurement for shape edges
 */
const EdgeMeasurement = ({
	startPoint,
	endPoint,
	length,
}: EdgeMeasurementProps) => {
	// Calculate edge properties
	const dx = endPoint.xPos - startPoint.xPos;
	const dy = endPoint.yPos - startPoint.yPos;
	const edgeLength = Math.sqrt(dx * dx + dy * dy);

	// Skip if edge is too short to display measurement
	if (edgeLength < 20) return null;

	// Calculate perpendicular offset for the arrow line
	const perpX = -dy / edgeLength;
	const perpY = dx / edgeLength;
	const offset = 20; // Distance from edge to arrow line

	// Calculate arrow line endpoints (parallel to the edge but offset)
	const arrowStartX = startPoint.xPos + perpX * offset;
	const arrowStartY = startPoint.yPos + perpY * offset;
	const arrowEndX = endPoint.xPos + perpX * offset;
	const arrowEndY = endPoint.yPos + perpY * offset;

	// Calculate midpoint for text placement
	const midX = (arrowStartX + arrowEndX) / 2;
	const midY = (arrowStartY + arrowEndY) / 2;

	// Arrow properties
	const arrowAngle = Math.atan2(dy, dx);
	const headLength = 8; // Length of arrow head lines

	// Left arrow head angles (pointing toward the center/right)
	const leftHeadAngle1 = arrowAngle + Math.PI * 0.2; // Pointing right
	const leftHeadAngle2 = arrowAngle - Math.PI * 0.2; // Pointing right

	// Right arrow head angles (pointing toward the center/left)
	const rightHeadAngle1 = arrowAngle + Math.PI * 0.8; // Pointing left
	const rightHeadAngle2 = arrowAngle - Math.PI * 0.8; // Pointing left

	// Left arrow head (at start of edge, pointing right)
	const leftHead1X = arrowStartX + Math.cos(leftHeadAngle1) * headLength;
	const leftHead1Y = arrowStartY + Math.sin(leftHeadAngle1) * headLength;
	const leftHead2X = arrowStartX + Math.cos(leftHeadAngle2) * headLength;
	const leftHead2Y = arrowStartY + Math.sin(leftHeadAngle2) * headLength;

	// Right arrow head (at end of edge, pointing left)
	const rightHead1X = arrowEndX + Math.cos(rightHeadAngle1) * headLength;
	const rightHead1Y = arrowEndY + Math.sin(rightHeadAngle1) * headLength;
	const rightHead2X = arrowEndX + Math.cos(rightHeadAngle2) * headLength;
	const rightHead2Y = arrowEndY + Math.sin(rightHeadAngle2) * headLength;

	// Convert pixels to inches (96 DPI standard)
	const inches = length / 96;
	const lengthText = `${Math.round(inches)}"`;

	return (
		<Group listening={false}>
			{/* Main arrow line spanning the full edge length */}
			<Line
				points={[arrowStartX, arrowStartY, arrowEndX, arrowEndY]}
				stroke="#D1D5DB"
				strokeWidth={2}
				listening={false}
			/>

			{/* Left arrow head (pointing towards start) */}
			<Line
				points={[arrowStartX, arrowStartY, leftHead1X, leftHead1Y]}
				stroke="#D1D5DB"
				strokeWidth={2}
				listening={false}
			/>
			<Line
				points={[arrowStartX, arrowStartY, leftHead2X, leftHead2Y]}
				stroke="#D1D5DB"
				strokeWidth={2}
				listening={false}
			/>

			{/* Right arrow head (pointing towards end) */}
			<Line
				points={[arrowEndX, arrowEndY, rightHead1X, rightHead1Y]}
				stroke="#D1D5DB"
				strokeWidth={2}
				listening={false}
			/>
			<Line
				points={[arrowEndX, arrowEndY, rightHead2X, rightHead2Y]}
				stroke="#D1D5DB"
				strokeWidth={2}
				listening={false}
			/>

			{/* White background for text */}
			<Rect
				x={midX - lengthText.length * 3 - 4}
				y={midY - 8}
				width={lengthText.length * 6 + 8}
				height={16}
				fill="#FFFFFF"
				cornerRadius={2}
				listening={false}
			/>

			{/* Length text */}
			<Text
				x={midX}
				y={midY}
				text={lengthText}
				fontSize={12}
				fill="#6B7280"
				align="center"
				verticalAlign="middle"
				offsetX={lengthText.length * 3} // Approximate text width offset
				offsetY={6} // Half font size for vertical centering
				listening={false}
			/>
		</Group>
	);
};

export default EdgeMeasurement;
