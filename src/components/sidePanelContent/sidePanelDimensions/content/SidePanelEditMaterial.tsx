import { IconArrowLeft, IconCopy, IconTrash } from "@tabler/icons-react";

import type { FC } from "react";
import Button from "~/components/header/header/Button";
import { Icon } from "~/components/header/header/Icon";
import { SheetFooter, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import type { SidePanelDimensionsView } from "../SidePanelDimensions";
import { useShape } from "~/components/header/context/ShapeContext";
import { useRouter } from "next/router";
import { useSetMaterialToShape } from "~/hooks/mutations/useSetMaterialToShape";
import { useSetMaterialToShapesWithoutMaterial } from "~/hooks/mutations/useSetMaterialToShapesWithoutMaterial";
import { useSetMaterialToAllShapes } from "~/hooks/mutations/useSetMaterialToAllShapes";
import { useRemoveMaterialFromShapes } from "~/hooks/mutations/useRemoveMaterialFromShapes";
import EditNoneMaterial from "../components/EditNoneMaterial";
import EditMaterial from "../components/EditMaterial";

interface SidePanelEditMaterialProps {
	setView: (value: SidePanelDimensionsView) => void;
}

const SidePanelEditMaterial: FC<SidePanelEditMaterialProps> = ({ setView }) => {
	const router = useRouter();
	const idParam = router.query.id;
	const designId = Array.isArray(idParam) ? idParam[0] : idParam;

	const { selectedMaterial, getNumberOfShapesPerMaterial, selectedShape } =
		useShape();

	const { mutate: setMaterialToShapesWithoutMaterial } =
		useSetMaterialToShapesWithoutMaterial();

	const { mutate: setMaterialToAllShapes } = useSetMaterialToAllShapes();

	const { mutate: removeMaterialFromShapes } = useRemoveMaterialFromShapes();

	const { mutate: setMaterialToShape } = useSetMaterialToShape({
		material: selectedMaterial,
	});

	const handleSetMaterialToShapesWithoutMaterial = () => {
		if (selectedMaterial?.id && designId) {
			setMaterialToShapesWithoutMaterial({
				materialId: selectedMaterial?.id,
				designId: designId,
			});
		}
	};

	const handleSetMaterialToAllShapes = () => {
		if (selectedMaterial?.id && designId) {
			setMaterialToAllShapes({
				materialId: selectedMaterial?.id,
				designId: designId,
			});
		}
	};

	const handleRemoveMaterial = () => {
		if (selectedMaterial?.id && designId) {
			removeMaterialFromShapes({
				materialId: selectedMaterial?.id,
				designId: designId,
			});
		}
		setView("general");
	};

	const handleRemoveMaterialFromSelectedShape = () => {
		if (selectedShape?.id && designId) {
			setMaterialToShape({
				id: selectedShape?.id,
				materialId: null,
			});
			setView("general");
		}
	};

	const numberOfShapesWithMaterial = getNumberOfShapesPerMaterial(
		selectedMaterial?.id,
	);

	const numberOfShapesWithoutMaterial = getNumberOfShapesPerMaterial();

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
					Material Parameters
				</SheetTitle>
			</SheetHeader>
			{selectedMaterial === null ? (
				<EditNoneMaterial
					numberOfShapesWithoutMaterial={numberOfShapesWithoutMaterial}
				/>
			) : (
				<EditMaterial
					selectedMaterial={selectedMaterial}
					numberOfShapesWithMaterial={numberOfShapesWithMaterial}
					numberOfShapesWithoutMaterial={numberOfShapesWithoutMaterial}
					handleRemoveMaterialFromSelectedShape={
						handleRemoveMaterialFromSelectedShape
					}
					handleSetMaterialToAllShapes={handleSetMaterialToAllShapes}
					handleSetMaterialToShapesWithoutMaterial={
						handleSetMaterialToShapesWithoutMaterial
					}
					selectedShape={selectedShape}
				/>
			)}
			<SheetFooter>
				{selectedMaterial === null ? (
					<Button
						variant="outlined"
						iconLeft={
							<Icon size="md">
								<IconCopy />
							</Icon>
						}
						color="neutral"
						className="justify-center"
						disabled
					>
						Duplicate
					</Button>
				) : (
					<div className="flex w-full items-center gap-2">
						<Button
							variant="outlined"
							iconLeft={
								<Icon size="md">
									<IconCopy />
								</Icon>
							}
							color="neutral"
							disabled
							className="flex-1 justify-center"
						>
							Duplicate
						</Button>
						<Button
							variant="outlined"
							iconLeft={
								<Icon size="md">
									<IconTrash />
								</Icon>
							}
							color="danger"
							className="flex-1 justify-center"
							onClick={handleRemoveMaterial}
						>
							Remove
						</Button>
					</div>
				)}
			</SheetFooter>
		</>
	);
};

export default SidePanelEditMaterial;
