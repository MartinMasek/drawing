import type { EdgeShapePosition } from "@prisma/client";
import type { FC } from "react";

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

			<div className="flex h-[36px] items-center rounded-lg border border-border-neutral">
				<p>Left</p>
				<p>Center</p>
				<p>Right</p>
			</div>
		</div>
	);
};

export default PositioningInput;
