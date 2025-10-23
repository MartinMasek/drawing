import type { FC } from "react";
import { NumberInput } from "~/components/NumberInput";

interface CurvesSizeInputProps {
	onChange: (value: { depth: number; width: number }) => void;
	depth: number;
	width: number;
}

const CurvesSizeInput: FC<CurvesSizeInputProps> = ({
	onChange,
	depth,
	width,
}) => {
	const handleDepthChange = (value: number) => {
		onChange({ depth: value, width });
	};

	const handleWidthChange = (value: number) => {
		onChange({ depth, width: value });
	};
	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm text-text-input-label">Size (DxW)</p>
			<div className="flex w-[305px] items-center justify-between">
				<NumberInput className="h-[36px] w-[140px]"
					value={depth}
					inputSize="sm"
					endAdornment={<p className="text-sm">in</p>}
					onChange={handleDepthChange}
				/>
				<p className="text-sm text-text-neutral-disabled">x</p>
				<NumberInput className="h-[36px] w-[140px]"
					value={width}
					inputSize="sm"
					endAdornment={<p className="text-sm">in</p>}
					onChange={handleWidthChange}
				/>
			</div>
		</div>
	);
};

export default CurvesSizeInput;
