import type { FC } from "react";
import { SheetContent, SheetFooter, SheetHeader, SheetTitle } from "../../ui/sheet";
import { useShape } from "~/components/header/context/ShapeContext";
import SinkTypeInput from "./components/SinkTypeInput";
import SinkShapeInput from "./components/SinkShapeInput";
import SinkSizeInput from "./components/SinkSizeInput";
import FaucetHolesInput from "./components/FaucetHolesInput";
import CenterLinesInput from "./components/CenterLinesInput";
import Button from "~/components/header/header/Button";
import { Icon } from "~/components/header/header/Icon";
import { IconCopy, IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/router";
import useUpdateSinkSizeDebounced from "~/hooks/mutations/cutouts/useUpdateSinkSizeDebounced";
import type { CentrelinesX, CentrelinesY, CutoutShape, CutoutSinkType } from "@prisma/client";
import useUpdateSinkTypeDebounced from "~/hooks/mutations/cutouts/useUpdateSinkTypeDebounced";
import useUpdateSinkShapeDebounced from "~/hooks/mutations/cutouts/useUpdateSinkShapeDebounced";
import useUpdateSinkFaucetHolesDebounced from "~/hooks/mutations/cutouts/useUpdateSinkFaucetHolesDebounced";
import useUpdateSinkCentrelinesDebounced from "~/hooks/mutations/cutouts/useUpdateSinkCentrelinesDebounced";
import useRemoveCutout from "~/hooks/mutations/cutouts/useRemoveCutout";
import { useDrawing } from "~/components/header/context/DrawingContext";

const CutoutSheet: FC = () => {
	const { designId } = useDrawing();
	const { selectedCutout } = useShape();

	const updateSinkType = useUpdateSinkTypeDebounced(designId);
	const updateSinkShape = useUpdateSinkShapeDebounced(designId);
	const updateSinkSize = useUpdateSinkSizeDebounced(designId);
	const updateSinkFaucetHoles = useUpdateSinkFaucetHolesDebounced(designId);
	const updateSinkCentrelines = useUpdateSinkCentrelinesDebounced(designId);
	const removeCutout = useRemoveCutout(designId);

	const handleUpdateSinkType = (value: CutoutSinkType) => {
		if (!selectedCutout?.sinkCutoutConfig.id) return;
		updateSinkType.updateSinkType(selectedCutout.sinkCutoutConfig.id, value);
	}
	const handleUpdateSinkShape = (value: CutoutShape) => {
		if (!selectedCutout?.sinkCutoutConfig.id) return;
		updateSinkShape.updateSinkShape(selectedCutout.sinkCutoutConfig.id, value);
	}
	const handleUpdateSinkSize = (value: { length: number; width: number }) => {
		if (!selectedCutout?.sinkCutoutConfig.id) return;
		updateSinkSize.updateSinkSize(selectedCutout.sinkCutoutConfig.id, value.length, value.width);
	}
	const handleUpdateSinkFaucetHoles = (value: number) => {
		if (!selectedCutout?.sinkCutoutConfig.id) return;
		updateSinkFaucetHoles.updateSinkFaucetHoles(selectedCutout.sinkCutoutConfig.id, value);
	}
	const handleUpdateSinkCentrelines = (value: { centerLinesX: CentrelinesX; centerLinesY: CentrelinesY }) => {
		if (!selectedCutout?.sinkCutoutConfig.id) return;
		updateSinkCentrelines.updateSinkCentrelines(selectedCutout.sinkCutoutConfig.id, value.centerLinesX, value.centerLinesY);
	}

	const handleRemoveCutout = () => {
		if (!selectedCutout?.id) return;
		removeCutout.mutate({ cutoutId: selectedCutout.id });
	}

	return (
		<SheetContent
			onInteractOutside={(e) => e.preventDefault()}
			className="gap-0"
		>
			<SheetHeader>
				<SheetTitle className="text-xl">Cutout Parameters</SheetTitle>
			</SheetHeader>

			{!selectedCutout ? (
				<p className="p-4 text-gray-400 text-xs">
					Click within a shape to open the cutout menu. Use it to add a new
					cutout or click an existing one to adjust its parameters
				</p>
			) : (
				<div className="flex flex-col gap-4 p-4">
					<p>Cutout Type: <span className="text-text-colors-secondary">Sink</span></p>
					<div className="flex gap-2">
						<SinkTypeInput value={selectedCutout?.sinkCutoutConfig.sinkType} onChange={handleUpdateSinkType} />
						<SinkShapeInput value={selectedCutout?.sinkCutoutConfig.shape} onChange={handleUpdateSinkShape} />
					</div>
					<SinkSizeInput
						length={selectedCutout?.sinkCutoutConfig.length ?? 0}
						width={selectedCutout?.sinkCutoutConfig.width ?? 0}
						onChange={handleUpdateSinkSize}
					/>
					<FaucetHolesInput holes={selectedCutout?.sinkCutoutConfig.holeCount ?? 0} onChange={handleUpdateSinkFaucetHoles} />
					<CenterLinesInput centerLinesY={selectedCutout?.sinkCutoutConfig.centrelinesY} centerLinesX={selectedCutout?.sinkCutoutConfig.centrelinesX} onChange={handleUpdateSinkCentrelines} />
				</div>
			)}
			{selectedCutout && (
				<SheetFooter>
					<Button
						variant="outlined"
						iconLeft={
							<Icon size="md">
								<IconDeviceFloppy />
							</Icon>
						}
						color="neutral"
						disabled
						className="flex-1 justify-center"
					>
						Save as Template
					</Button>
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
							onClick={handleRemoveCutout}
						>
							Remove
						</Button>
					</div>

				</SheetFooter>
			)}
		</SheetContent>
	);
};

export default CutoutSheet;
