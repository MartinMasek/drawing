import { IconArrowLeft, IconCopy, IconTrash } from "@tabler/icons-react";
import type { FC } from "react";
import Button from "~/components/Button";
import { Icon } from "~/components/Icon";
import { SheetFooter, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import type { ShapeSheetView } from "../ShapeSheet";
import LengthInput from "../components/LengthInput";
import { CornerModificationList } from "~/types/drawing";
import { useShape } from "~/context/ShapeContext";
import RadiusInput from "../components/RadiusInput";
import DepthInput from "../components/DepthInput";
import { CornerType } from "@prisma/client";
import useDeleteCornerModification from "~/hooks/mutations/corners/useDeleteCornerModification";
import useUpdateCornerLengthDebounced from "~/hooks/mutations/corners/useUpdateCornerLengthDebounced";
import useUpdateCornerRadiusDebounced from "~/hooks/mutations/corners/useUpdateCornerRadiusDebounced";
import useUpdateCornerDepthDebounced from "~/hooks/mutations/corners/useUpdateCornerDepthDebounced";
import useUpdateCornerClipDebounced from "~/hooks/mutations/corners/useUpdateCornerClipDebounced";
import ClipInput from "../components/ClipInput";
import { useDrawing } from "~/context/DrawingContext";

interface EditCornerProps {
	setView: (value: ShapeSheetView) => void;
}

const EditCorner: FC<EditCornerProps> = ({ setView }) => {
	const { designId } = useDrawing();

	const { selectedCorner, selectedShape } = useShape();
	const deleteCornerModification = useDeleteCornerModification(designId);
	const updateCornerRadius = useUpdateCornerRadiusDebounced(designId);
	const updateCornerLength = useUpdateCornerLengthDebounced(designId);
	const updateCornerDepth = useUpdateCornerDepthDebounced(designId);
	const updateCornerClip = useUpdateCornerClipDebounced(designId);

	const handleRadiusChange = (value: number) => {
		if (!selectedCorner?.cornerId) return;
		updateCornerRadius.updateRadius(
			selectedCorner.cornerId,
			value,
		);
	};
	const handleLengthChange = (value: number) => {
		if (!selectedCorner?.cornerId) return;
		updateCornerLength.updateLength(
			selectedCorner.cornerId,
			value,
		);
	};
	const handleDepthChange = (value: number) => {
		if (!selectedCorner?.cornerId) return;
		updateCornerDepth.updateDepth(
			selectedCorner.cornerId,
			value
		);
	};

	const handleClipChange = (value: number) => {
		if (!selectedCorner?.cornerId) return;
		updateCornerClip.updateClip(
			selectedCorner.cornerId,
			value
		);
	};

	const handleDeleteCornerModification = () => {
		if (!selectedCorner?.cornerId) return;
		if (!selectedShape) return;

		deleteCornerModification.mutate({
			cornerId: selectedCorner.cornerId,
		});
		setView("generalCorners");
	};
	const cornerTypeLabel = CornerModificationList.find((c) => c.id === selectedCorner?.type)?.label;
	const cornerType = selectedCorner?.type;
	return (
		<>
			<SheetHeader>
				<SheetTitle className="flex items-center gap-2 text-xl">
					<Button
						color="neutral"
						iconOnly
						size="sm"
						variant="text"
						onClick={() => setView("generalCorners")}
					>
						<Icon size="md">
							<IconArrowLeft />
						</Icon>
					</Button>
					Corner Parameters
				</SheetTitle>
			</SheetHeader>
			<div className="flex flex-col gap-4 p-4">
				<p>
					Corner Type:{" "}
					<span className="text-text-colors-secondary">
						{cornerTypeLabel}
					</span>
				</p>
				<div className="flex h-[170px] items-center justify-center rounded-md border border-border-neutral">
					<span className="text-sm text-text-neutral-disabled">TBD.</span>
				</div>
				{cornerType === CornerType.Radius &&
					<RadiusInput onChange={handleRadiusChange} radius={selectedCorner?.radius ?? 0} />
				}
				{cornerType === CornerType.Clip &&
					<ClipInput onChange={handleClipChange} clip={selectedCorner?.clip ?? 0} />
				}
				{(cornerType === CornerType.BumpOut || cornerType === CornerType.Notch) &&
					<>
						<LengthInput onChange={handleLengthChange} length={selectedCorner?.modificationLength ?? 0} />
						<DepthInput onChange={handleDepthChange} depth={selectedCorner?.modificationDepth ?? 0} />
					</>
				}
			</div>
			<SheetFooter>
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
						onClick={handleDeleteCornerModification}
					>
						Remove
					</Button>
				</div>
			</SheetFooter>
		</>
	);
};

export default EditCorner;
