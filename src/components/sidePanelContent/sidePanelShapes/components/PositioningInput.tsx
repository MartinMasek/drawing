import { EdgeShapePosition } from "@prisma/client";
import type { FC } from "react";
import Button from "~/components/header/header/Button";

interface PositioningInputProps {
	onChange: (value: string) => void;
	position: EdgeShapePosition;
	/** Array of available positions - positions not in this array will be disabled */
	availablePositions?: EdgeShapePosition[];
}

const PositioningInput: FC<PositioningInputProps> = ({
	onChange,
	position,
	availablePositions,
}) => {
	// If availablePositions not provided, all positions are available
	const isPositionAvailable = (pos: EdgeShapePosition) =>
		!availablePositions || availablePositions.includes(pos);
	const handlePositionChange = (value: string) => {
		onChange(value);
	};
	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm text-text-input-label">Positioning</p>

			<div className="flex h-[36px] w-[305px] items-center justify-between rounded-lg">
				<Button variant="outlined"
					color={position === EdgeShapePosition.Left ? "primary" : "neutral"}
					className="h-[36px] flex-1 justify-center rounded-r-none border-r-0"
					onClick={() => handlePositionChange(EdgeShapePosition.Left)}
					disabled={!isPositionAvailable(EdgeShapePosition.Left)}
					title={!isPositionAvailable(EdgeShapePosition.Left) ? "Position already occupied" : undefined}
				>
					Left
				</Button>
				<Button variant="outlined"
					color={position === EdgeShapePosition.Center ? "primary" : "neutral"}
					className="h-[36px] flex-1 justify-center rounded-none"
					onClick={() => handlePositionChange(EdgeShapePosition.Center)}
					disabled={!isPositionAvailable(EdgeShapePosition.Center)}
					title={!isPositionAvailable(EdgeShapePosition.Center) ? "Position already occupied" : undefined}
				>
					Center
				</Button>
				<Button variant="outlined"
					color={position === EdgeShapePosition.Right ? "primary" : "neutral"}
					className="h-[36px] flex-1 justify-center rounded-l-none border-l-0"
					onClick={() => handlePositionChange(EdgeShapePosition.Right)}
					disabled={!isPositionAvailable(EdgeShapePosition.Right)}
					title={!isPositionAvailable(EdgeShapePosition.Right) ? "Position already occupied" : undefined}
				>
					Right
				</Button>
			</div>
		</div>
	);
};

export default PositioningInput;
