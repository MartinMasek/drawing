import { memo } from "react";
import { Circle, Text, Group } from "react-konva";

interface DebugPointProps {
	x: number;
	y: number;
	id: string;
	label: string;
	color: string;
	scale: number;
}

/**
 * Reusable debug point component
 * Renders a circle with ID and coordinates text
 * Memoized to prevent unnecessary re-renders
 */
const DebugPoint = ({ x, y, id, label, color, scale }: DebugPointProps) => {
	const fontSize = Math.max(10, 12 / scale);
	const pointRadius = Math.max(3, 5 / scale);
	const textOffset = Math.max(8, 10 / scale);

	return (
		<Group listening={false}>
			{/* Point circle */}
			<Circle
				x={x}
				y={y}
				radius={pointRadius}
				fill={color}
				stroke="#000000"
				strokeWidth={1 / scale}
				listening={false}
			/>

			{/* Point ID and coordinates */}
			<Group x={x + textOffset} y={y - textOffset} listening={false}>
				{/* Background for better readability */}
				<Text
					text={`${label}\nID: ${id.slice(0, 8)}...\nX: ${x.toFixed(1)}\nY: ${y.toFixed(1)}`}
					fontSize={fontSize}
					fill="#FFFFFF"
					stroke="#000000"
					strokeWidth={3 / scale}
					listening={false}
				/>
				{/* Actual text */}
				<Text
					text={`${label}\nID: ${id.slice(0, 8)}...\nX: ${x.toFixed(1)}\nY: ${y.toFixed(1)}`}
					fontSize={fontSize}
					fill={color}
					listening={false}
				/>
			</Group>
		</Group>
	);
};

export default memo(DebugPoint);

