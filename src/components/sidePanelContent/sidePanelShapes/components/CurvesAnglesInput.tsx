import { Input } from "~/components/Input";
import type { FC } from "react";
import { SelectStyled } from "~/components/SelectStyled";

interface AngleOption {
	label: string;
	value: number;
}

interface CurvesAnglesInputProps {
	onChange: (value: { left: number; right: number }) => void;
	left: number;
	right: number;
}

const CurvesAnglesInput: FC<CurvesAnglesInputProps> = ({
	onChange,
	left,
	right,
}) => {

	const anglesOptions: AngleOption[] = [
		{ label: "0°", value: 0 },
		{ label: "15°", value: 15 },
		{ label: "30°", value: 30 },
		{ label: "45°", value: 45 },
		{ label: "60°", value: 60 },
		{ label: "75°", value: 75 },
		{ label: "90°", value: 90 },
	];
	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm text-text-input-label">Angles (Left-Right)</p>
			<div className="flex w-[305px] items-center justify-between gap-1">
				<SelectStyled<AngleOption>
					options={anglesOptions}
					inputSize="sm"
					rounded
					className="h-[36px] w-[140px]"
					value={anglesOptions.find((option) => option.value === left)}
				// onChange={(value) => onChange({ left: value, right: right })} 
				/>
				<p className="text-sm text-text-neutral-disabled">-</p>
				<SelectStyled<AngleOption>
					options={anglesOptions}
					inputSize="sm"
					rounded
					className="h-[36px] w-[140px]"
					value={anglesOptions.find((option) => option.value === right)}
				// onChange={(value) => onChange({ left: left, right: value })}
				/>

			</div>
		</div>
	);
};

export default CurvesAnglesInput;
