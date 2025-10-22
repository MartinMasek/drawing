import type { FC } from "react";
import { useRouter } from "next/router";
import { EdgeModificationType } from "@prisma/client";
import { useUpdateEdgeModification } from "~/hooks/mutations/edges/useUpdateEdgeModification";
import { useShape } from "~/components/header/context/ShapeContext";
import { SheetHeader, SheetTitle } from "~/components/ui/sheet";
import ShapeCard from "../../components/ShapeCard";
import type { ShapeSidePanelView } from "../ShapeSidePanel";
import { useCreateEdgeModification } from "~/hooks/mutations/edges/useCreateEdgeModification";
import { useDeleteEdgeModification } from "~/hooks/mutations/edges/useDeleteEdgeModification";
import BumpOutIcon from "~/components/icons/BumpOutIcon";
import BumpInIcon from "~/components/icons/BumpInIcon";
import BumpOutCurveIcon from "~/components/icons/BumpOutCurve";
import BumpInCurveIcon from "~/components/icons/BumpInCurveIcon";
import FullCurveIcon from "~/components/icons/FullCurveIcon";
import CurvesNoneIcon from "~/components/icons/CurvesNoneIcon";

interface CurvesAndBumpsSidePanelGeneralProps {
	setView: (value: ShapeSidePanelView) => void;
}

const CurvesAndBumpsSidePanelGeneral: FC<
	CurvesAndBumpsSidePanelGeneralProps
> = ({ setView }) => {
	const { selectedEdge, selectedShape } = useShape();
	const router = useRouter();
	const idParam = router.query.id;
	const designId = Array.isArray(idParam) ? idParam[0] : idParam;
	const updateEdge = useUpdateEdgeModification(designId);
	const createEdge = useCreateEdgeModification(designId);
	const deleteEdgeModification = useDeleteEdgeModification(designId);

	const handleSelectModification = (type: EdgeModificationType) => {
		if (!selectedEdge) return;
		if (!selectedShape) return;
		if (!selectedEdge.edgeModification) return;

		if (selectedEdge.edgeModification.type === type) {
			setView("editCurves");
			return;
		};

		if (!selectedEdge.edgeId) { // If no edge id, create a new edge
			createEdge.mutate({
				shapeId: selectedShape.id,
				edgePoint1Id: selectedEdge.edgePoint1Id,
				edgePoint2Id: selectedEdge.edgePoint2Id,
				edgeModification: {
					edgeType: type,
					position: selectedEdge.edgeModification.position,
					distance: selectedEdge.edgeModification.distance,
					depth: selectedEdge.edgeModification.depth,
					width: selectedEdge.edgeModification.width,
					sideAngleLeft: selectedEdge.edgeModification.sideAngleLeft,
					sideAngleRight: selectedEdge.edgeModification.sideAngleRight,
					fullRadiusDepth: selectedEdge.edgeModification.fullRadiusDepth,
				},
			});
		} else { // If edge id, update the existing edge
			updateEdge.mutate({
				edgeId: selectedEdge.edgeId,
				shapeId: selectedShape.id,
				edgeModificationId: selectedEdge.edgeModification.id,
				edgeModification: {
					edgeType: type,
					position: selectedEdge.edgeModification.position,
					distance: selectedEdge.edgeModification.distance,
					depth: selectedEdge.edgeModification.depth,
					width: selectedEdge.edgeModification.width,
					sideAngleLeft: selectedEdge.edgeModification.sideAngleLeft,
					sideAngleRight: selectedEdge.edgeModification.sideAngleRight,
					fullRadiusDepth: selectedEdge.edgeModification.fullRadiusDepth,
				}
			});
		}

		setView("editCurves");
	};


	const handleDeleteEdgeModification = () => {
		if (!selectedEdge?.edgeModification?.id) return;
		if (!selectedShape) return;

		deleteEdgeModification.mutate({
			edgeModificationId: selectedEdge.edgeModification.id,
		});
	};
	return (
		<>
			<SheetHeader>
				<SheetTitle className="text-xl">Curves & Bumps</SheetTitle>
			</SheetHeader>
			{!selectedEdge ? (
				<div className="flex flex-col gap-4 p-4">
					<p className="text-gray-400 text-sm">
						Click on an edge or element in the canvas to see the available
						options and set up its parameters
					</p>
				</div>
			) : (
				<>
					<p className=" px-4 pt-4 font-semibold text-text-neutral-secondary text-xs">
						GENERAL
					</p>
					<div className="grid grid-cols-2 gap-4 p-4">
						<ShapeCard
							id='BumpOut'
							name={"Bump-Out"}
							icon={<BumpOutIcon />}
							onClick={() => handleSelectModification(EdgeModificationType.BumpOut)}
							isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.BumpOut}
						/>

						<ShapeCard
							id="BumpIn"
							name={"Bump-In"}
							icon={<BumpInIcon />}
							onClick={() => handleSelectModification(EdgeModificationType.BumpIn)}
							isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.BumpIn}
						/>

						<ShapeCard
							id='BumpOutCurve'
							name={"Bump-Out Curve"}
							icon={<BumpOutCurveIcon />}
							onClick={() => handleSelectModification(EdgeModificationType.BumpOutCurve)}
							isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.BumpOutCurve}
						/>

						<ShapeCard
							id='BumpInCurve'
							name={"Bump-In Curve"}
							icon={<BumpInCurveIcon />}
							onClick={() => handleSelectModification(EdgeModificationType.BumpInCurve)}
							isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.BumpInCurve}
						/>

						<ShapeCard
							id='FullCurve'
							name={"Full Curve"}
							icon={<FullCurveIcon />}
							onClick={() => handleSelectModification(EdgeModificationType.FullCurve)}
							isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.FullCurve}
						/>

						<ShapeCard
							id='None'
							name={"None"}
							icon={<CurvesNoneIcon />}
							onClick={handleDeleteEdgeModification}
							isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.None}
						/>
					</div>
				</>
			)}
		</>
	);
};

export default CurvesAndBumpsSidePanelGeneral;
