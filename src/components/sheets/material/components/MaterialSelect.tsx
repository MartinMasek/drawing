import type { FC } from "react";
import { useShape } from "~/components/context/ShapeContext";
import { SelectStyled } from "~/components/SelectStyled";
import type { MaterialExtended } from "~/types/drawing";
import { api } from "~/utils/api";

interface MaterialSelectProps {
	value: MaterialExtended | null;
	onChange: (material: MaterialExtended | null) => void;
	disabled?: boolean;
}

const MaterialSelect: FC<MaterialSelectProps> = ({
	value,
	onChange,
	disabled,
}) => {
	const { data: materialOptions } = api.design.getMaterialOptions.useQuery();
	const { materials } = useShape();

	// Filter out the materials that are already used
	const materialFilteredOption = materialOptions?.filter(
		(material) => !materials.some((m) => m.id === material.id),
	);
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<p className="text-sm text-text-input-label">
					Material <span className="text-icons-danger">*</span>
				</p>
				<p className="text-sm text-text-neutral-secondary">
					{/* Insert checkbox */}
					{/* Link to Quote Line */}
				</p>
			</div>
			{/* Async select later */}
			<SelectStyled<MaterialExtended>
				label="Material"
				placeholder="Select a material"
				inputSize="sm"
				value={value}
				getOptionLabel={(m) => m.name}
				getOptionValue={(m) => m.id.toString()}
				rounded
				options={materialFilteredOption}
				onChange={(option) => onChange(option)}
				isDisabled={disabled}
			/>
		</div>
	);
};

export default MaterialSelect;
