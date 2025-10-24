import { IconArrowLeft, IconCopy, IconTrash } from "@tabler/icons-react";
import type { FC } from "react";
import Button from "~/components/header/header/Button";
import { Icon } from "~/components/header/header/Icon";
import { SheetFooter, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import type { ShapeSidePanelView } from "../ShapeSidePanel";
import CurvesSizeInput from "../components/CurvesSizeInput";
import CurvesAnglesInput from "../components/CurvesAnglesInput";
import PositioningInput from "../components/PositioningInput";
import DistanceInput from "../components/DistanceInput";
import { useShape } from "~/components/header/context/ShapeContext";
import { EdgeModificationList } from "~/types/drawing";
import { EdgeModificationType, EdgeShapePosition } from "@prisma/client";
import { useDeleteEdgeModification } from "~/hooks/mutations/edges/useDeleteEdgeModification";
import { useRouter } from "next/router";
import { useUpdateEdgeModificationAnglesDebounced } from "~/hooks/mutations/edges/useUpdateEdgeModificationAnglesDebounced";
import { useUpdateEdgeModificationDistanceDebounced } from "~/hooks/mutations/edges/useUpdateEdgeModificationDistanceDebounced";
import { useUpdateEdgeModificationPositionDebounced } from "~/hooks/mutations/edges/useUpdateEdgeModificationPositionDebounced";
import { useUpdateEdgeModificationSizeDebounced } from "~/hooks/mutations/edges/useUpdateEdgeModificationSizeDebounced";
import FullRadiusDepthInput from "../components/FullRadiusDepthInput";
import useUpdateEdgeModificationFullRadiusDebounced from "~/hooks/mutations/edges/useUpdateEdgeModificationFullRadiusDebounced";

interface EditCurvesAndBumpsProps {
	setView: (value: ShapeSidePanelView) => void;
}

const EditCurvesAndBumps: FC<EditCurvesAndBumpsProps> = ({ setView }) => {
	const router = useRouter();
	const idParam = router.query.id;
	const designId = Array.isArray(idParam) ? idParam[0] : idParam;
	const { selectedEdge } = useShape();
	const deleteEdgeModification = useDeleteEdgeModification(designId);
	const updateEdgeModificationAngles = useUpdateEdgeModificationAnglesDebounced(designId);
	const updateEdgeModificationPosition = useUpdateEdgeModificationPositionDebounced(designId);
	const updateEdgeModificationDistance = useUpdateEdgeModificationDistanceDebounced(designId);
	const updateEdgeModificationFullRadiusDepth = useUpdateEdgeModificationFullRadiusDebounced(designId);
	const updateEdgeModificationSize = useUpdateEdgeModificationSizeDebounced(designId);

	const handleSizeChange = (value: { depth: number; width: number }) => {
		if (!selectedEdge?.edgeModification?.id) return;

		updateEdgeModificationSize.updateSize(
			selectedEdge.edgeModification.id,
			value.depth,
			value.width
		);
	};

	const handleAnglesChange = (value: { left: number; right: number }) => {
		if (!selectedEdge?.edgeModification?.id) return;

		updateEdgeModificationAngles.updateAngles(
			selectedEdge.edgeModification.id,
			value.left,
			value.right
		);
	};

	const handlePositionChange = (value: string) => {
		if (!selectedEdge?.edgeModification?.id) return;

		updateEdgeModificationPosition.updatePosition(
			selectedEdge.edgeModification.id,
			value as EdgeShapePosition
		);
	};

	const handleDistanceChange = (value: number) => {
		if (!selectedEdge?.edgeModification?.id) return;

		updateEdgeModificationDistance.updateDistance(
			selectedEdge.edgeModification.id,
			value
		);
	};

	const handleFullRadiusDepthChange = (value: number) => {
		if (!selectedEdge?.edgeModification?.id) return;

		updateEdgeModificationFullRadiusDepth.updateFullRadiusDepth(
			selectedEdge.edgeModification.id,
			value
		);
	}

	const handleDeleteEdgeModification = () => {
		if (!selectedEdge?.edgeModification?.id) return;

		deleteEdgeModification.mutate({
			edgeModificationId: selectedEdge.edgeModification.id,
		});

		setView("generalCurves");
	};

	const bumpTypeLabel = EdgeModificationList.find((em) => em.id === selectedEdge?.edgeModification?.type)?.label;
	const bumpType = selectedEdge?.edgeModification?.type;
	const hasPosition = selectedEdge?.edgeModification?.position !== EdgeShapePosition.Center;
	return (
		<>
			<SheetHeader>
				<SheetTitle className="flex items-center gap-2 text-xl">
					<Button
						color="neutral"
						iconOnly
						size="sm"
						variant="text"
						onClick={() => setView("generalCurves")}
					>
						<Icon size="md">
							<IconArrowLeft />
						</Icon>
					</Button>
					Bump Parameters
				</SheetTitle>
			</SheetHeader>
			<div className="flex flex-col gap-4 p-4">
				<p>
					Bump Type:{" "}
					<span className="text-text-colors-secondary">
						{bumpTypeLabel}
					</span>
				</p>
				<div className="flex h-[170px] items-center justify-center rounded-md border border-border-neutral">
					<span className="text-sm text-text-neutral-disabled">TBD.</span>
				</div>
				{bumpType !== EdgeModificationType.FullCurve &&
					<CurvesSizeInput
						onChange={handleSizeChange}
						depth={selectedEdge?.edgeModification?.depth ?? 0}
						width={selectedEdge?.edgeModification?.width ?? 0}
					/>
				}
				{(bumpType === EdgeModificationType.BumpOut || bumpType === EdgeModificationType.BumpIn) &&
					<CurvesAnglesInput
						onChange={handleAnglesChange}
						left={selectedEdge?.edgeModification?.sideAngleLeft ?? 0}
						right={selectedEdge?.edgeModification?.sideAngleRight ?? 0}
					/>
				}
				{bumpType !== EdgeModificationType.FullCurve &&
					<PositioningInput
						onChange={handlePositionChange}
						position={selectedEdge?.edgeModification?.position ?? EdgeShapePosition.Center}
					/>
				}
				{bumpType !== EdgeModificationType.FullCurve && hasPosition &&
					<DistanceInput
						onChange={handleDistanceChange}
						distance={selectedEdge?.edgeModification?.distance ?? 0}
					/>
				}
				{bumpType === EdgeModificationType.FullCurve &&
					<FullRadiusDepthInput
						onChange={handleFullRadiusDepthChange}
						fullRadiusDepth={selectedEdge?.edgeModification?.fullRadiusDepth ?? 0}
					/>
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
						onClick={handleDeleteEdgeModification}

					>
						Remove
					</Button>
				</div>
			</SheetFooter>
		</>
	);
};

export default EditCurvesAndBumps;
