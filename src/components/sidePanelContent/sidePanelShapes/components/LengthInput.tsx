import type { FC } from "react";
import { Input } from "~/components/Input";

interface LengthInputProps {
	onChange: (value: number) => void;
	length: number;
}

const LengthInput: FC<LengthInputProps> = ({ onChange, length }) => {

	const handleLengthChange = (value: string) => {
		onChange(Number.parseFloat(value));
	};
	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm text-text-input-label">Length</p>

			<Input className="h-[36px]"
				fullWidth={true}
				value={length}
				inputSize="sm"
				endAdornment={<p className="text-sm">in</p>}
				onChange={(e) => handleLengthChange(e.target.value)}
			/>
		</div>
	);
};

export default LengthInput;
