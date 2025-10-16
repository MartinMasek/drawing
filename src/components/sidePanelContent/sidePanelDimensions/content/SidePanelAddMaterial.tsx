import { IconArrowLeft } from "@tabler/icons-react";

import { useState, type FC } from "react";
import Button from "~/components/header/header/Button";
import { Icon } from "~/components/header/header/Icon";
import { SheetFooter, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import type { SidePanelDimensionsView } from "../SidePanelDimensions";
import { useShape } from "~/components/header/context/ShapeContext";
import MaterialDetail from "../components/MaterialDetail";
import { useSetMaterialToShape } from "~/hooks/mutations/useSetMaterialToShape";
import type { MaterialExtended } from "~/types/drawing";
import MaterialSelect from "../components/MaterialSelect";

interface SidePanelAddMaterialProps {
	setView: (value: SidePanelDimensionsView) => void;
}

const SidePanelAddMaterial: FC<SidePanelAddMaterialProps> = ({ setView }) => {
	const { selectedShape, materials, setMaterials } = useShape();

	// Material that is selected from the select
	const [material, setMaterial] = useState<MaterialExtended | null>(null);

	const { mutate: setMaterialToShape } = useSetMaterialToShape({ material });

	const handleSave = () => {
		if (selectedShape?.id && material) {
			setMaterialToShape({
				id: selectedShape.id,
				materialId: material?.id,
			});
		}

		if (material) {
			setMaterials([...materials, material]);
		}

		setView("general");
	};

	const handleSaveAndAddOther = () => {
		if (material) {
			setMaterials([...materials, material]);
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
				<MaterialSelect value={material} onChange={setMaterial} />
				<MaterialDetail material={material ? material : undefined} />
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
