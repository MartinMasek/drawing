import type { FC } from "react";
import { NumberInput } from "~/components/NumberInput";

interface DistanceInputProps {
	onChange: (value: number) => void;
	distance: number;
}

const DistanceInput: FC<DistanceInputProps> = ({ onChange, distance }) => {
	const handleDistanceChange = (value: number) => {
		onChange(value);
	};
	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm text-text-input-label">Distance</p>

			<NumberInput className="h-[36px]"
				fullWidth={true}
				value={distance}
				inputSize="sm"
				endAdornment={<p className="text-sm">in</p>}
				onChange={handleDistanceChange}
				onlyPositive
			/>
		</div>
	);
};

export default DistanceInput;
