import type { FC } from "react";
import { NumberInput } from "~/components/NumberInput";

interface CurvesSizeInputProps {
	onChange: (value: { depth: number; width: number }) => void;
	depth: number;
	width: number;
	type: 'normal' | 'curve'
}

const CurvesSizeInput: FC<CurvesSizeInputProps> = ({
	onChange,
	depth,
	width,
	type,
}) => {
	const maxDepthValue = type === 'curve' ? width / 2 : undefined;

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
					max={maxDepthValue}
					onlyPositive
				/>
				<p className="text-sm text-text-neutral-disabled">x</p>
				<NumberInput className="h-[36px] w-[140px]"
					value={width}
					inputSize="sm"
					endAdornment={<p className="text-sm">in</p>}
					onChange={handleWidthChange}
					onlyPositive
				/>
			</div>
			{type === 'curve' &&
				<p className="text-sm text-text-colors-warning">
					Depth must be less than or equal to half the width.
				</p>
			}
		</div>
	);
};

export default CurvesSizeInput;
