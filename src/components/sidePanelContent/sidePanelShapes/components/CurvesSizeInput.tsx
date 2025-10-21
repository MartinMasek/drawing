import { useState, type FC } from "react";
import { Input } from "~/components/Input";

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
	const [localDepth, setLocalDepth] = useState(depth);
	const [localWidth, setLocalWidth] = useState(width);

	const handleDepthChange = (value: string) => {
		setLocalDepth(Number.parseFloat(value));
		onChange({ depth: Number.parseFloat(value), width: localWidth });
	};

	const handleWidthChange = (value: string) => {
		setLocalWidth(Number.parseFloat(value));
		onChange({ depth: localDepth, width: Number.parseFloat(value) });
	};
	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm text-text-input-label">Size (DxW)</p>
			<div className="flex w-[305px] items-center justify-between">
				<Input className="h-[36px] w-[140px]"
					value={localDepth}
					inputSize="sm"
					endAdornment={<p className="text-sm">in</p>}
					onChange={(e) => handleDepthChange(e.target.value)}
				/>
				<p className="text-sm text-text-neutral-disabled">x</p>
				<Input className="h-[36px] w-[140px]"
					value={localWidth}
					inputSize="sm"
					endAdornment={<p className="text-sm">in</p>}
					onChange={(e) => handleWidthChange(e.target.value)}
				/>
			</div>
		</div>
	);
};

export default CurvesSizeInput;
