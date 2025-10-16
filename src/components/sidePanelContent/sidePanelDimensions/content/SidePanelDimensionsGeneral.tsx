import { IconAlertCircleFilled, IconPlus } from "@tabler/icons-react";
import type { FC } from "react";
import { useShape } from "~/components/header/context/ShapeContext";
import Button from "~/components/header/header/Button";
import { Divider } from "~/components/header/header/Divider";
import { Icon } from "~/components/header/header/Icon";
import { SheetFooter, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import MaterialTile from "../components/MaterialTile";
import type { SidePanelDimensionsView } from "../SidePanelDimensions";
import type { MaterialExtended } from "~/types/drawing";
import { useSetMaterialToShape } from "~/hooks/mutations/useSetMaterialToShape";

interface SidePanelDimensionsGeneralProps {
	setView: (value: SidePanelDimensionsView) => void;
}

const SidePanelDimensionsGeneral: FC<SidePanelDimensionsGeneralProps> = ({
	setView,
}) => {
	const {
		selectedShape,
		materials,
		getNumberOfShapesPerMaterial,
		setSelectedMaterial,
	} = useShape();

	const { mutate: setMaterialToShape } = useSetMaterialToShape({
		material: null,
	});

	const handleEditClick = (material: MaterialExtended | null) => {
		setSelectedMaterial(material);
		setView("editMaterial");
	};

	const numberOfShapesWithoutMaterial = getNumberOfShapesPerMaterial();

	return (
		<>
			<SheetHeader>
				<SheetTitle className="text-xl">Materials</SheetTitle>
			</SheetHeader>
			<div className="flex flex-col gap-2 p-4">
				<p className="text-gray-400 text-xs">
					Create and manage materials. You can pick a material before drawing or
					assign it to shapes later. Use one material for all shapes or
					different ones for each.
				</p>
				<Divider className="border-[0.5px]" />

				{materials?.map((material) => (
					<MaterialTile
						key={material.id}
						name={material.name}
						description={`Applied: 0 SF (${getNumberOfShapesPerMaterial(material.id)} shape${getNumberOfShapesPerMaterial(material.id) === 1 ? "" : "s"})`}
						img={material.img}
						isSelected={selectedShape?.material?.id === material.id}
						onSelect={() => {
							// Set material to the selected shape
							if (selectedShape?.id) {
								setMaterialToShape({
									id: selectedShape?.id,
									materialId: material.id,
								});
							}
						}}
						onEdit={() => handleEditClick(material)}
					/>
				))}
				{/* This is the default material (None) */}
				<MaterialTile
					name="None"
					description={
						<span className="flex items-center gap-1">
							Applied: 0 SF ({numberOfShapesWithoutMaterial} shape
							{numberOfShapesWithoutMaterial === 1 ? "" : "s"})
							{numberOfShapesWithoutMaterial > 0 && (
								<Icon size="sm" color="warning">
									<IconAlertCircleFilled />
								</Icon>
							)}
						</span>
					}
					img={null}
					isSelected={!selectedShape?.material}
					onSelect={() => {
						// Set material to null for the selected shape
						if (selectedShape?.id) {
							setMaterialToShape({
								id: selectedShape?.id,
								materialId: null,
							});
						}
					}}
					onEdit={() => handleEditClick(null)}
				/>
			</div>

			<SheetFooter>
				<Button
					variant="contained"
					iconLeft={
						<Icon size="md">
							<IconPlus />
						</Icon>
					}
					color="primary"
					onClick={() => setView("addMaterial")}
					className="justify-center"
				>
					Add material
				</Button>
			</SheetFooter>
		</>
	);
};

export default SidePanelDimensionsGeneral;
