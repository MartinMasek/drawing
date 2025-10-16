import type { FC } from "react";

interface PackagesBreakdownProps {
	numberOfShapes: number;
}

const PackagesBreakdown: FC<PackagesBreakdownProps> = ({ numberOfShapes }) => {
	return (
		<div className="flex flex-col">
			<span className="flex items-center justify-between">
				<p className="text-sm text-text-neutral-terciary">Applied:</p>
				<p className="text-sm text-text-neutral-primary">0 SF total</p>
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
