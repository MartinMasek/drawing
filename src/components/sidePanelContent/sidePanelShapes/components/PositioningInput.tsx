import type { FC } from "react";

const PositioningInput: FC = () => {
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
