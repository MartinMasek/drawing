import { Input } from "@headlessui/react";
import type { FC } from "react";

interface LengthInputProps {
	onChange: (value: number) => void;
	length: number;
}

const LengthInput: FC<LengthInputProps> = ({ onChange, length }) => {
	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm text-text-input-label">Length</p>

			<Input className="h-[36px] rounded-lg border border-border-input-default text-center text-sm" />
		</div>
	);
};

export default LengthInput;
