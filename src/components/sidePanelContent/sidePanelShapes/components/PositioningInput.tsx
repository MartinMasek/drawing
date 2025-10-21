import { EdgeShapePosition } from "@prisma/client";
import type { FC } from "react";
import Button from "~/components/header/header/Button";

interface PositioningInputProps {
	onChange: (value: string) => void;
	position: EdgeShapePosition;
}

const PositioningInput: FC<PositioningInputProps> = ({
	onChange,
	position,
}) => {
	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm text-text-input-label">Positioning</p>

			<div className="flex h-[36px] w-[305px] items-center justify-between rounded-lg">
				<Button variant="outlined" color={position === EdgeShapePosition.Left ? "primary" : "neutral"} className="h-[36px] flex-1 justify-center rounded-r-none border-r-0">
					Left
				</Button>
				<Button variant="outlined" color={position === EdgeShapePosition.Center ? "primary" : "neutral"} className="h-[36px] flex-1 justify-center rounded-none">
					Center
				</Button>
				<Button variant="outlined" color={position === EdgeShapePosition.Right ? "primary" : "neutral"} className="h-[36px] flex-1 justify-center rounded-l-none border-l-0">
					Right
				</Button>
			</div>
		</div>
	);
};

export default PositioningInput;
