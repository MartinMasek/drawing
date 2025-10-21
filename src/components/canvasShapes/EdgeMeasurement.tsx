import { Group, Line, Rect, Text } from "react-konva";
import type { Coordinate } from "~/types/drawing";
import {
	DPI,
	MEASUREMENT_LINE_STROKE,
	MEASUREMENT_TEXT_BACKGROUND_COLOR,
	MEASUREMENT_TEXT_COLOR,
} from "~/utils/canvas-constants";
import { formatInches } from "~/utils/ui-utils";

interface EdgeMeasurementProps {
	startPoint: Coordinate;
	endPoint: Coordinate;
	length: number;
	scale: number;
}

/**
 * Renders a double-sided arrow with length measurement for shape edges
 */
const EdgeMeasurement = ({
	startPoint,
	endPoint,
	length,
	scale,
}: EdgeMeasurementProps) => {
	// Calculate edge properties
	const dx = endPoint.xPos - startPoint.xPos;
	const dy = endPoint.yPos - startPoint.yPos;
	const edgeLength = Math.sqrt(dx * dx + dy * dy);

	// Skip if edge is too short to display measurement (scaled threshold)
	if (edgeLength < 20 / scale) return null;

	// Calculate perpendicular offset for the arrow line (scaled to maintain constant visual distance)
	const perpX = -dy / edgeLength;
	const perpY = dx / edgeLength;
	const offset = 20 / scale; // Distance from edge to arrow line, scaled inversely

	// Calculate arrow line endpoints (parallel to the edge but offset)
	const arrowStartX = startPoint.xPos + perpX * offset;
	const arrowStartY = startPoint.yPos + perpY * offset;
	const arrowEndX = endPoint.xPos + perpX * offset;
	const arrowEndY = endPoint.yPos + perpY * offset;

	// Calculate midpoint for text placement
	const midX = (arrowStartX + arrowEndX) / 2;
	const midY = (arrowStartY + arrowEndY) / 2;

	// Arrow properties (scaled inversely to maintain constant visual size)
	const arrowAngle = Math.atan2(dy, dx);
	const headLength = 8 / scale; // Length of arrow head lines, scaled inversely

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

	// Convert pixels to inches (DPI standard)
	const inches = length / DPI;

	const lengthText = formatInches(inches);

	// Scale-independent visual properties
	const strokeWidth = 2 / scale;
	const fontSize = 12 / scale;
	const textPadding = 4 / scale;
	const charWidth = 6 / scale;
	const cornerRadius = 2 / scale;

	return (
		<Group listening={false}>
			{/* Main arrow line spanning the full edge length */}
			<Line
				points={[arrowStartX, arrowStartY, arrowEndX, arrowEndY]}
				stroke={MEASUREMENT_LINE_STROKE}
				strokeWidth={strokeWidth}
				listening={false}
			/>

			{/* Left arrow head (pointing towards start) */}
			<Line
				points={[arrowStartX, arrowStartY, leftHead1X, leftHead1Y]}
				stroke={MEASUREMENT_LINE_STROKE}
				strokeWidth={strokeWidth}
				listening={false}
			/>
			<Line
				points={[arrowStartX, arrowStartY, leftHead2X, leftHead2Y]}
				stroke={MEASUREMENT_LINE_STROKE}
				strokeWidth={strokeWidth}
				listening={false}
			/>

			{/* Right arrow head (pointing towards end) */}
			<Line
				points={[arrowEndX, arrowEndY, rightHead1X, rightHead1Y]}
				stroke={MEASUREMENT_LINE_STROKE}
				strokeWidth={strokeWidth}
				listening={false}
			/>
			<Line
				points={[arrowEndX, arrowEndY, rightHead2X, rightHead2Y]}
				stroke={MEASUREMENT_LINE_STROKE}
				strokeWidth={strokeWidth}
				listening={false}
			/>

			{/* White background for text */}
			<Rect
				x={midX - lengthText.length * charWidth / 2 - textPadding}
				y={midY - fontSize / 2 - textPadding}
				width={lengthText.length * charWidth + textPadding * 2}
				height={fontSize + textPadding * 2}
				fill={MEASUREMENT_TEXT_BACKGROUND_COLOR}
				cornerRadius={cornerRadius}
				listening={false}
			/>

			{/* Length text */}
			<Text
				x={midX}
				y={midY}
				text={lengthText}
				fontSize={fontSize}
				fill={MEASUREMENT_TEXT_COLOR}
				align="center"
				verticalAlign="middle"
				offsetX={lengthText.length * charWidth / 2}
				offsetY={fontSize / 2}
				listening={false}
			/>
		</Group>
	);
};

export default EdgeMeasurement;
