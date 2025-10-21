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
import { EdgeShapePosition } from "@prisma/client";
import { useDeleteEdgeModification } from "~/hooks/mutations/edges/useDeleteEdgeModification";
import { useRouter } from "next/router";
import { useUpdateEdgeModificationAngles } from "~/hooks/mutations/edges/useUpdateEdgeModificationAngles";
import { useUpdateEdgeModificationDistance } from "~/hooks/mutations/edges/useUpdateEdgeModificationDistance";
import { useUpdateEdgeModificationPosition } from "~/hooks/mutations/edges/useUpdateEdgeModificationPosition";
import { useUpdateEdgeModificationSize } from "~/hooks/mutations/edges/useUpdateEdgeModificationSize";

interface EditCurvesAndBumpsProps {
	setView: (value: ShapeSidePanelView) => void;
}

const EditCurvesAndBumps: FC<EditCurvesAndBumpsProps> = ({ setView }) => {
	const router = useRouter();
	const idParam = router.query.id;
	const designId = Array.isArray(idParam) ? idParam[0] : idParam;
	const { selectedEdge } = useShape();
	const deleteEdgeModification = useDeleteEdgeModification(designId);
	const updateEdgeModificationSize = useUpdateEdgeModificationSize(designId);
	const updateEdgeModificationAngles = useUpdateEdgeModificationAngles(designId);
	const updateEdgeModificationPosition = useUpdateEdgeModificationPosition(designId);
	const updateEdgeModificationDistance = useUpdateEdgeModificationDistance(designId);

	const handleSizeChange = (value: { depth: number; width: number }) => {
		if (!selectedEdge?.edgeModification?.id) return;

		updateEdgeModificationSize.mutate({
			edgeModificationId: selectedEdge.edgeModification.id,
			depth: value.depth,
			width: value.width,
		});
	};

	const handleAnglesChange = (value: { left: number; right: number }) => {
		if (!selectedEdge?.edgeModification?.id) return;

		updateEdgeModificationAngles.mutate({
			edgeModificationId: selectedEdge.edgeModification.id,
			sideAngleLeft: value.left,
			sideAngleRight: value.right,
		});
	};

	const handlePositionChange = (value: string) => {
		if (!selectedEdge?.edgeModification?.id) return;

		updateEdgeModificationPosition.mutate({
			edgeModificationId: selectedEdge.edgeModification.id,
			position: value as EdgeShapePosition,
		});
	};

	const handleDistanceChange = (value: number) => {
		if (!selectedEdge?.edgeModification?.id) return;

		updateEdgeModificationDistance.mutate({
			edgeModificationId: selectedEdge.edgeModification.id,
			distance: value,
		});
	};

	const handleDeleteEdgeModification = () => {
		if (!selectedEdge?.edgeModification?.id) return;

		deleteEdgeModification.mutate({
			edgeModificationId: selectedEdge.edgeModification.id,
		});

		setView("generalCurves");
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
						{EdgeModificationList.find((em) => em.id === selectedEdge?.edgeModification?.type)?.label}
					</span>
				</p>
				<div className="flex h-[170px] items-center justify-center rounded-md border border-border-neutral">
					<span className="text-sm text-text-neutral-disabled">TBD.</span>
				</div>
				<CurvesSizeInput
					onChange={handleSizeChange}
					depth={selectedEdge?.edgeModification?.depth ?? 0}
					width={selectedEdge?.edgeModification?.width ?? 0}
				/>
				<CurvesAnglesInput
					onChange={handleAnglesChange}
					left={selectedEdge?.edgeModification?.sideAngleLeft ?? 0}
					right={selectedEdge?.edgeModification?.sideAngleRight ?? 0}
				/>
				<PositioningInput
					onChange={handlePositionChange}
					position={selectedEdge?.edgeModification?.position ?? EdgeShapePosition.Center}
				/>
				<DistanceInput
					onChange={handleDistanceChange}
					distance={selectedEdge?.edgeModification?.distance ?? 0}
				/>
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
