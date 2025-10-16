import type { FC } from "react";

interface PackagesBreakdownProps {
	numberOfShapes: number;
	totalArea: number;
}

const PackagesBreakdown: FC<PackagesBreakdownProps> = ({
	numberOfShapes,
	totalArea,
}) => {
	return (
		<div className="flex flex-col">
			<span className="flex items-center justify-between">
				<p className="text-sm text-text-neutral-terciary">Applied:</p>
				<p className="text-sm text-text-neutral-primary">
					{totalArea.toFixed(2)} SF total
				</p>
			</span>
			<span className="flex items-center justify-between">
				<p className="text-text-button-secondary-disabledOnWhiteBg text-xs">
					Packages Breakdown:
				</p>
				<p className="text-text-neutral-terciary text-xs">
					{numberOfShapes} shape
					{numberOfShapes === 1 ? "" : "s"}
				</p>
			</span>
		</div>
	);
};

export default PackagesBreakdown;
