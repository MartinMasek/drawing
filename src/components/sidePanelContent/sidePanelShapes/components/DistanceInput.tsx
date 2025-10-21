import type { FC } from "react";
import { Input } from "~/components/Input";

interface DistanceInputProps {
	onChange: (value: number) => void;
	distance: number;
}

const DistanceInput: FC<DistanceInputProps> = ({ onChange, distance }) => {
	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm text-text-input-label">Distance</p>

			<Input className="h-[36px]"
				fullWidth={true}
				value={distance}
				inputSize="sm"
				endAdornment={<p className="text-sm">in</p>}
			// onChange={(e) => onChange(Number(e.target.value))}
			/>
		</div>
	);
};

export default DistanceInput;
