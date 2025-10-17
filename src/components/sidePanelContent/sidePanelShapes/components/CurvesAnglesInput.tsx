import { Input } from "@headlessui/react";
import type { FC } from "react";

const CurvesAnglesInput: FC = () => {
	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm text-text-input-label">Angles (Left-Right)</p>
			<div className="flex items-center gap-1">
				<Input className="h-[36px] w-[140px] rounded-lg border border-border-input-default text-center text-sm" />
				<p className="text-sm text-text-neutral-disabled">-</p>
				<Input className="h-[36px] w-[140px] rounded-lg border border-border-input-default text-center text-sm" />
			</div>
		</div>
	);
};

export default CurvesAnglesInput;
