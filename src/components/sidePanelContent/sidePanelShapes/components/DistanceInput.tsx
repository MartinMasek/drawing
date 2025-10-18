import { Input } from "@headlessui/react";
import type { FC } from "react";

interface DistanceInputProps {
	onChange: (value: number) => void;
	distance: number;
}

const DistanceInput: FC<DistanceInputProps> = ({ onChange, distance }) => {
	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm text-text-input-label">Distance</p>

			<Input className="h-[36px] rounded-lg border border-border-input-default text-center text-sm" />
		</div>
	);
};

export default DistanceInput;
