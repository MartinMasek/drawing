import { IconArrowLeft, IconCopy, IconTrash } from "@tabler/icons-react";

import type { FC } from "react";
import Button from "~/components/Button";
import { Icon } from "~/components/Icon";
import { SheetFooter, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import type { MaterialSheetView } from "../MaterialSheet";
import { useShape } from "~/components/context/ShapeContext";
import { useSetMaterialToShape } from "~/hooks/mutations/materials/useSetMaterialToShape";
import { useSetMaterialToShapesWithoutMaterial } from "~/hooks/mutations/materials/useSetMaterialToShapesWithoutMaterial";
import { useSetMaterialToAllShapes } from "~/hooks/mutations/materials/useSetMaterialToAllShapes";
import { useRemoveMaterialFromShapes } from "~/hooks/mutations/materials/useRemoveMaterialFromShapes";
import EditNoneMaterial from "../components/EditNoneMaterial";
import EditSelectedMaterial from "../components/EditSelectedMaterial";
import { useDrawing } from "~/components/context/DrawingContext";

interface EditMaterialProps {
	setView: (value: MaterialSheetView) => void;
}

const EditMaterial: FC<EditMaterialProps> = ({ setView }) => {
	const { designId } = useDrawing();

	const {
		selectedMaterial,
		getNumberOfShapesPerMaterial,
		selectedShape,
		getAllShapesWithMaterial,
	} = useShape();

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
					getAllShapesWithMaterial={getAllShapesWithMaterial}
				/>
			) : (
				<EditSelectedMaterial
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
					getAllShapesWithMaterial={getAllShapesWithMaterial}
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

export default EditMaterial;
