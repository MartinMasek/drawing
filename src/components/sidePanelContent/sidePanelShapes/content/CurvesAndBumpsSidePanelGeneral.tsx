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
							icon={
								// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
								<svg
									width="53"
									height="52"
									viewBox="0 0 53 52"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M6.75 41.1663H45.75V19.4997H37.0833L32.75 10.833H20.3947L16.0614 19.4997H6.75V41.1663Z"
										stroke="#9CA3AF"
										stroke-width="2"
										stroke-linejoin="round"
									/>
								</svg>
							}
							onClick={() => handleSelectModification(EdgeModificationType.BumpOut)}
							isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.BumpOut}
						/>

						<ShapeCard
							id="BumpIn"
							name={"Bump-In"}
							icon={
								// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
								<svg
									width="53"
									height="52"
									viewBox="0 0 53 52"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M7.25 41.1667H46.25V19.5H37.5833L33.25 28.1667H20.8947L16.5614 19.5H7.25V41.1667Z"
										stroke="#9CA3AF"
										stroke-width="2"
										stroke-linejoin="round"
									/>
								</svg>
							}
							onClick={() => handleSelectModification(EdgeModificationType.BumpIn)}
							isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.BumpIn}
						/>

						<ShapeCard
							id='BumpOutCurve'
							name={"Bump-Out Curve"}
							icon={
								// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
								<svg
									width="53"
									height="52"
									viewBox="0 0 53 52"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M6.75 41.1663H45.75V19.4997H37.0833C37.0833 19.4997 34.9167 10.833 26.25 10.833C17.5833 10.833 16.0614 19.4997 16.0614 19.4997H6.75V41.1663Z"
										stroke="#9CA3AF"
										stroke-width="2"
										stroke-linejoin="round"
									/>
								</svg>
							}
							onClick={() => handleSelectModification(EdgeModificationType.BumpOutCurve)}
							isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.BumpOutCurve}
						/>

						<ShapeCard
							id='BumpInCurve'
							name={"Bump-In Curve"}
							icon={
								// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
								<svg
									width="53"
									height="52"
									viewBox="0 0 53 52"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M7.25 41.1667H46.25V19.5H37.5833C37.5833 19.5 35.4167 28.1667 26.75 28.1667C18.0833 28.1667 16.5614 19.5 16.5614 19.5H7.25V41.1667Z"
										stroke="#9CA3AF"
										stroke-width="2"
										stroke-linejoin="round"
									/>
								</svg>
							}
							onClick={() => handleSelectModification(EdgeModificationType.BumpInCurve)}
							isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.BumpInCurve}
						/>

						<ShapeCard
							id='FullCurve'
							name={"Full Curve"}
							icon={
								// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
								<svg
									width="53"
									height="52"
									viewBox="0 0 53 52"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M6.75 41.1663H45.75V19.4997C45.75 19.4997 40.3333 10.833 26.25 10.833C12.1667 10.833 6.75 19.4997 6.75 19.4997V41.1663Z"
										stroke="#9CA3AF"
										stroke-width="2"
										stroke-linejoin="round"
									/>
								</svg>
							}
							onClick={() => handleSelectModification(EdgeModificationType.FullCurve)}
							isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.FullCurve}
						/>

						<ShapeCard
							id='None'
							name={"None"}
							icon={
								// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
								<svg
									width="53"
									height="52"
									viewBox="0 0 53 52"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M7.25 41.1667H46.25V19.5H7.25V41.1667Z"
										stroke="#9CA3AF"
										stroke-width="2"
										stroke-linejoin="round"
									/>
								</svg>
							}
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
