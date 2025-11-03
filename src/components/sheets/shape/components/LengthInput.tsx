import type { FC } from "react";
import { NumberInput } from "~/components/NumberInput";

interface LengthInputProps {
	onChange: (value: number) => void;
	length: number;
}

const LengthInput: FC<LengthInputProps> = ({ onChange, length }) => {

	const handleLengthChange = (value: number) => {
		onChange(value);
	};
	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm text-text-input-label">Length</p>

			<NumberInput className="h-[36px]"
				fullWidth={true}
				value={length}
				inputSize="sm"
				endAdornment={<p className="text-sm">in</p>}
				onChange={handleLengthChange}
			/>
		</div>
	);
};

export default LengthInput;
