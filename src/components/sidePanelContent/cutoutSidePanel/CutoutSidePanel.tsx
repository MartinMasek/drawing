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

const CutoutSidePanel: FC = () => {
	const router = useRouter();
	const idParam = router.query.id;
	const designId = Array.isArray(idParam) ? idParam[0] : idParam;
	const { selectedCutout } = useShape();

	const updateSinkType = useUpdateSinkTypeDebounced(designId);
	const updateSinkShape = useUpdateSinkShapeDebounced(designId);
	const updateSinkSize = useUpdateSinkSizeDebounced(designId);
	const updateSinkFaucetHoles = useUpdateSinkFaucetHolesDebounced(designId);
	const updateSinkCentrelines = useUpdateSinkCentrelinesDebounced(designId);
	const removeCutout = useRemoveCutout(designId);

	const handleUpdateSinkType = (value: CutoutSinkType) => {
		if (!selectedCutout?.config.id) return;
		updateSinkType.updateSinkType(selectedCutout.config.id, value);
	}
	const handleUpdateSinkShape = (value: CutoutShape) => {
		if (!selectedCutout?.config.id) return;
		updateSinkShape.updateSinkShape(selectedCutout.config.id, value);
	}
	const handleUpdateSinkSize = (value: { length: number; width: number }) => {
		if (!selectedCutout?.config.id) return;
		updateSinkSize.updateSinkSize(selectedCutout.config.id, value.length, value.width);
	}
	const handleUpdateSinkFaucetHoles = (value: number) => {
		if (!selectedCutout?.config.id) return;
		updateSinkFaucetHoles.updateSinkFaucetHoles(selectedCutout.config.id, value);
	}
	const handleUpdateSinkCentrelines = (value: { centerLinesX: CentrelinesX; centerLinesY: CentrelinesY }) => {
		if (!selectedCutout?.config.id) return;
		updateSinkCentrelines.updateSinkCentrelines(selectedCutout.config.id, value.centerLinesX, value.centerLinesY);
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
						<SinkTypeInput value={selectedCutout?.config.sinkType} onChange={handleUpdateSinkType} />
						<SinkShapeInput value={selectedCutout?.config.shape} onChange={handleUpdateSinkShape} />
					</div>
					<SinkSizeInput
						length={selectedCutout?.config.length ?? 0}
						width={selectedCutout?.config.width ?? 0}
						onChange={handleUpdateSinkSize}
					/>
					<FaucetHolesInput holes={selectedCutout?.config.holeCount ?? 0} onChange={handleUpdateSinkFaucetHoles} />
					<CenterLinesInput centerLinesY={selectedCutout?.config.centrelinesY} centerLinesX={selectedCutout?.config.centrelinesX} onChange={handleUpdateSinkCentrelines} />
				</div>
			)}
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
		</SheetContent>
	);
};

export default CutoutSidePanel;
