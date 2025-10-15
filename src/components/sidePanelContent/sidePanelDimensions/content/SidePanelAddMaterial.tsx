import { IconArrowLeft } from "@tabler/icons-react";

import { useState, type FC } from "react";
import Button from "~/components/header/header/Button";
import { Icon } from "~/components/header/header/Icon";
import { SheetFooter, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import type { SidePanelDimensionsView } from "../SidePanelDimensions";
import { SelectStyled } from "~/components/SelectStyled";
import { useShape } from "~/components/header/context/ShapeContext";
import { api } from "~/utils/api";
import MaterialDetail from "../components/MaterialDetail";
import { useSetMaterialToShape } from "~/hooks/mutations/useSetMaterialToShape";

type OptionType = {
	label: string;
	value: string;
	img: string | null;
	SKU: string;
	category: string;
	subcategory: string;
};

interface SidePanelAddMaterialProps {
	setView: (value: SidePanelDimensionsView) => void;
}

const SidePanelAddMaterial: FC<SidePanelAddMaterialProps> = ({ setView }) => {
	const { selectedShape, materials, setMaterials } = useShape();

	// Material that is selected from the select
	const [material, setMaterial] = useState<OptionType | null>(null);

	const { data: materialOptions } = api.design.getMaterialOptions.useQuery();

	const { mutate: setMaterialToShape } = useSetMaterialToShape();

	// Filter out the materials that are already used
	const materialFilteredOption = materialOptions?.filter(
		(material) => !materials.some((m) => m.id === material.id),
	);

	const mappedMaterialOptions = materialFilteredOption?.map((material) => ({
		label: material.name,
		value: material.id,
		img: material.img,
		SKU: material.SKU,
		category: material.category,
		subcategory: material.subcategory,
	}));

	const mapToLocalMaterial = (material: OptionType) => ({
		id: material.value,
		name: material.label,
		img: material.img,
		SKU: material.SKU,
		category: material.category,
		subcategory: material.subcategory,
	});

	const handleSave = () => {
		if (selectedShape?.id && material) {
			setMaterialToShape({
				id: selectedShape.id,
				materialId: material?.value,
			});
		}

		if (material) {
			setMaterials([...materials, mapToLocalMaterial(material)]);
		}
		setView("general");
	};

	const handleSaveAndAddOther = () => {
		if (material) {
			setMaterials([...materials, mapToLocalMaterial(material)]);
		}
		setMaterial(null);
	};

	return (
		<>
			<SheetHeader>
				<SheetTitle className="flex items-center gap-2 text-xl">
					<Button
						color="neutral"
						iconOnly
						size="sm"
						variant="text"
						onClick={() => setView("general")}
					>
						<Icon size="md">
							<IconArrowLeft />
						</Icon>
					</Button>
					Add Material
				</SheetTitle>
			</SheetHeader>
			<div className="flex flex-col gap-4 p-4">
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
					<SelectStyled<OptionType>
						label="Material"
						placeholder="Select a material"
						inputSize="sm"
						value={material}
						rounded
						options={mappedMaterialOptions}
						onChange={(option) => setMaterial(option)}
					/>
				</div>
				<MaterialDetail
					material={material ? mapToLocalMaterial(material) : undefined}
				/>
			</div>
			<SheetFooter>
				<div className="flex w-full items-center gap-2">
					<Button
						variant="contained"
						color="primary"
						className="flex-1 justify-center"
						disabled={!material}
						onClick={handleSave}
					>
						Save
					</Button>
					{/* Only show this button if no shape is selected
						else the user will be able to override the current material over and over again */}
					{!selectedShape && (
						<Button
							variant="outlined"
							color="primary"
							className="flex-1 justify-center"
							disabled={!material}
							onClick={handleSaveAndAddOther}
						>
							Save & Add Other
						</Button>
					)}
				</div>
			</SheetFooter>
		</>
	);
};

export default SidePanelAddMaterial;
