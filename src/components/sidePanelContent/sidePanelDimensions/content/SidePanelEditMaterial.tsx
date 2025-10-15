import {
	IconAlertCircleFilled,
	IconArrowLeft,
	IconCopy,
	IconTrash,
	IconX,
} from "@tabler/icons-react";

import type { FC } from "react";
import Button from "~/components/header/header/Button";
import { Icon } from "~/components/header/header/Icon";
import { SheetFooter, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import type { SidePanelDimensionsView } from "../SidePanelDimensions";
import { useShape } from "~/components/header/context/ShapeContext";
import { SelectStyled } from "~/components/SelectStyled";
import type { MaterialExtended } from "~/types/drawing";
import { Divider } from "~/components/header/header/Divider";
import MaterialDetail from "../components/MaterialDetail";
import { useRouter } from "next/router";
import { useSetMaterialToShape } from "~/hooks/mutations/useSetMaterialToShape";
import { useSetMaterialToShapesWithoutMaterial } from "~/hooks/mutations/useSetMaterialToShapesWithoutMaterial";
import { useSetMaterialToAllShapes } from "~/hooks/mutations/useSetMaterialToAllShapes";
import { useRemoveMaterialFromShapes } from "~/hooks/mutations/useRemoveMaterialFromShapes";

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

	const { mutate: setMaterialToShape } = useSetMaterialToShape();

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
				<div className="flex flex-col gap-4 p-4">
					<p>
						Material: <span className="text-text-colors-secondary">None</span>
					</p>
					<Divider className="border-[0.5px]" />
					<div className="flex flex-col">
						<span className="flex items-center justify-between">
							<p className="text-sm text-text-neutral-terciary">Applied:</p>
							<p className="text-sm text-text-neutral-primary">0 SF total</p>
						</span>
						<span className="flex items-center justify-between">
							<p className="text-text-button-secondary-disabledOnWhiteBg text-xs">
								Packages Breakdown:
							</p>
							<p className="text-text-neutral-terciary text-xs">
								{getNumberOfShapesPerMaterial()} shape
								{getNumberOfShapesPerMaterial() === 1 ? "" : "s"}
							</p>
						</span>
					</div>
					<Divider className="border-[0.5px]" />

					{/* Replace with Banner in stonify */}
					{!!getNumberOfShapesPerMaterial() && (
						<div className="flex gap-2 rounded-md bg-background-banners-warning-subtle p-3">
							<Icon size="md" color="warning">
								<IconAlertCircleFilled />
							</Icon>
							<div className="flex flex-col gap-1">
								<p className="font-bold text-sm text-text-neutral-primary">
									Unassigned Materials Detected
								</p>
								<p className="text-sm">
									Some shapes are still using this material option. To proceed
									with quote generation, please ensure{" "}
									<span className="font-bold">
										all shapes have an assigned material
									</span>
								</p>
							</div>
						</div>
					)}
				</div>
			) : (
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
						<SelectStyled<MaterialExtended>
							label="Material"
							placeholder="Select a material"
							inputSize="sm"
							value={selectedMaterial}
							rounded
							options={[]}
							onChange={() => {}}
						/>
					</div>
					<MaterialDetail material={selectedMaterial} />
					<Divider className="border-[0.5px]" />
					<div className="flex flex-col gap-2">
						<div className="flex flex-col">
							<span className="flex items-center justify-between">
								<p className="text-sm text-text-neutral-terciary">Applied:</p>
								<p className="text-sm text-text-neutral-primary">0 SF total</p>
							</span>
							<span className="flex items-center justify-between">
								<p className="text-text-button-secondary-disabledOnWhiteBg text-xs">
									Packages Breakdown:
								</p>
								<p className="text-text-neutral-terciary text-xs">
									{getNumberOfShapesPerMaterial(selectedMaterial?.id)} shape
									{getNumberOfShapesPerMaterial(selectedMaterial?.id) === 1
										? ""
										: "s"}
								</p>
							</span>
						</div>
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
								disabled={getNumberOfShapesPerMaterial() === 0}
								onClick={handleSetMaterialToShapesWithoutMaterial}
							>
								Unassigned ({getNumberOfShapesPerMaterial()})
							</Button>
						</div>
					</div>
				</div>
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
