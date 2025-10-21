import { useState, type FC } from "react";
import { Input } from "~/components/Input";

interface DistanceInputProps {
	onChange: (value: number) => void;
	distance: number;
}

const DistanceInput: FC<DistanceInputProps> = ({ onChange, distance }) => {
	const [localDistance, setLocalDistance] = useState(distance);

	const handleDistanceChange = (value: string) => {
		setLocalDistance(Number.parseFloat(value));
		onChange(Number.parseFloat(value));
	};
	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm text-text-input-label">Distance</p>

			<Input className="h-[36px]"
				fullWidth={true}
				value={localDistance}
				inputSize="sm"
				endAdornment={<p className="text-sm">in</p>}
				onChange={(e) => handleDistanceChange(e.target.value)}
			/>
		</div>
	);
};

export default DistanceInput;
