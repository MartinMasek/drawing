import { IconMinus, IconPlus } from "@tabler/icons-react";

import { Select } from "@headlessui/react";
import { CANVAS_MAX_ZOOM, CANVAS_MIN_ZOOM } from "~/utils/canvas-constants";
import { cn } from "~/utils/ui-utils";
import Button from "./Button";
import { Icon } from "./Icon";
import { SelectStyled } from "~/components/SelectStyled";

type ZoomProps = {
	min?: number;
	max?: number;
	step?: number;
	value: number;
	onChange: (zoom: number) => void;
	className?: string;
};

const Zoom: React.FC<ZoomProps> = ({
	min = CANVAS_MIN_ZOOM,
	max = CANVAS_MAX_ZOOM,
	step = 10,
	value,
	onChange,
	className,
}) => {
	const updateZoom = (newZoom: number) => {
		const clamped = Math.min(max, Math.max(min, newZoom));
		onChange(clamped);
	};

	const baseLevels = Array.from(
		{ length: Math.floor((max - min) / step) + 1 },
		(_, i) => min + i * step,
	);

	// Include current value if it's not in the predefined levels
	const zoomLevels = baseLevels.includes(value)
		? baseLevels
		: [...baseLevels, value].sort((a, b) => a - b);

	const zoomOptions = zoomLevels.map((level) => ({
		value: level,
		label: `${level}%`,
		}));
		  
	return (
		<div className={cn("flex", className)}>
			<Button
				className="rounded-r-none border-r-0"
				color="neutral"
				iconOnly
				onClick={() => updateZoom(value - step)}
				size="sm"
				variant="outlined"
			>
				<Icon size="md">
					<IconMinus />
				</Icon>
			</Button>

			<SelectStyled 
				className="w-24" 	
				inputSize="sm"			
				options={zoomOptions} 
				value={{ value, label: `${value}%` }} 
				onChange={(selectedOption) => {
					if (selectedOption) {
						updateZoom(selectedOption.value);
					}
				}}
			/>

			<Button
				className="rounded-l-none border-l-0"
				color="neutral"
				iconOnly
				onClick={() => updateZoom(value + step)}
				size="sm"
				variant="outlined"
			>
				<Icon size="md">
					<IconPlus />
				</Icon>
			</Button>
		</div>
	);
};

export default Zoom;
