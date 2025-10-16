import type { CanvasShape, MaterialExtended } from "~/types/drawing";
import MaterialSelect from "./MaterialSelect";
import type { FC } from "react";
import MaterialDetail from "./MaterialDetail";
import { Divider } from "~/components/header/header/Divider";
import PackagesBreakdown from "./PackagesBreakdown";
import Button from "~/components/header/header/Button";
import { Icon } from "~/components/header/header/Icon";
import { IconX } from "@tabler/icons-react";
import { getTotalAreaOfShapes } from "~/utils/ui-utils";

interface EditMaterialProps {
	selectedMaterial: MaterialExtended | null;
	numberOfShapesWithMaterial: number;
	numberOfShapesWithoutMaterial: number;
	handleRemoveMaterialFromSelectedShape: () => void;
	handleSetMaterialToAllShapes: () => void;
	handleSetMaterialToShapesWithoutMaterial: () => void;
	selectedShape: CanvasShape | null;
	getAllShapesWithMaterial: (materialId?: string) => CanvasShape[];
}

const EditMaterial: FC<EditMaterialProps> = ({
	selectedMaterial,
	numberOfShapesWithMaterial,
	numberOfShapesWithoutMaterial,
	handleRemoveMaterialFromSelectedShape,
	handleSetMaterialToAllShapes,
	handleSetMaterialToShapesWithoutMaterial,
	selectedShape,
	getAllShapesWithMaterial,
}) => {
	return (
		<div className="flex flex-col gap-4 p-4">
			<MaterialSelect
				value={selectedMaterial}
				onChange={() => {}}
				disabled={true}
			/>
			<MaterialDetail
				material={selectedMaterial ? selectedMaterial : undefined}
			/>
			<Divider className="border-[0.5px]" />
			<div className="flex flex-col gap-2">
				<PackagesBreakdown
					numberOfShapes={numberOfShapesWithMaterial}
					totalArea={getTotalAreaOfShapes(
						getAllShapesWithMaterial(selectedMaterial?.id),
					)}
				/>
				{selectedShape?.material?.id === selectedMaterial?.id && (
					<Button
						iconLeft={
							<Icon size="md">
								<IconX />
							</Icon>
						}
						variant="outlined"
						color="danger"
						className="flex-1 justify-center"
						onClick={handleRemoveMaterialFromSelectedShape}
					>
						Unassign Selected Shape
					</Button>
				)}
			</div>
			<Divider className="border-[0.5px]" />
			<div className="flex flex-col gap-2">
				<p className="text-sm text-text-neutral-terciary">
					Quick Apply To Shapes:
				</p>
				<div className="flex gap-2">
					<Button
						variant="outlined"
						color="neutral"
						className="flex-1 justify-center"
						onClick={handleSetMaterialToAllShapes}
					>
						All (#)
					</Button>
					<Button
						variant="outlined"
						color="neutral"
						className="flex-1 justify-center"
						disabled={numberOfShapesWithoutMaterial === 0}
						onClick={handleSetMaterialToShapesWithoutMaterial}
					>
						Unassigned ({numberOfShapesWithoutMaterial})
					</Button>
				</div>
			</div>
		</div>
	);
};

export default EditMaterial;
