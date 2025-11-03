import type { FC, JSX } from "react";
import { EdgeModificationType } from "@prisma/client";
import { useUpdateEdgeModification } from "~/hooks/mutations/edges/useUpdateEdgeModification";
import { useShape } from "~/components/context/ShapeContext";
import { SheetHeader, SheetTitle } from "~/components/ui/sheet";
import ShapeCard from "../../components/ShapeCard";
import type { ShapeSheetView } from "../ShapeSheet";
import { useCreateEdgeModification } from "~/hooks/mutations/edges/useCreateEdgeModification";
import { useDeleteEdgeModification } from "~/hooks/mutations/edges/useDeleteEdgeModification";
import BumpOutIcon from "~/components/icons/BumpOutIcon";
import BumpInIcon from "~/components/icons/BumpInIcon";
import BumpOutCurveIcon from "~/components/icons/BumpOutCurve";
import BumpInCurveIcon from "~/components/icons/BumpInCurveIcon";
import FullCurveIcon from "~/components/icons/FullCurveIcon";
import CurvesNoneIcon from "~/components/icons/CurvesNoneIcon";
import { getDefaultValueForEdgeModification } from "~/types/defaultValues";
import { generateEdgePoints } from "~/components/shape/edgeUtils";
import { EdgeModificationList } from "~/types/drawing";
import { useDrawing } from "~/components/context/DrawingContext";

interface CurveOverviewProps {
	setView: (value: ShapeSheetView) => void;
}
const curveAndBumpIcons: Record<EdgeModificationType, JSX.Element> = {
	[EdgeModificationType.BumpIn]: <BumpInIcon isActive={false} />,
	[EdgeModificationType.BumpOut]: <BumpOutIcon isActive={false} />,
	[EdgeModificationType.BumpInCurve]: <BumpInCurveIcon isActive={false} />,
	[EdgeModificationType.BumpOutCurve]: <BumpOutCurveIcon isActive={false} />,
	[EdgeModificationType.FullCurve]: <FullCurveIcon isActive={false} />,
	[EdgeModificationType.None]: <CurvesNoneIcon isActive={false} />,
};

const CurveOverview: FC<
	CurveOverviewProps
> = ({ setView }) => {
	const { designId } = useDrawing();

	const { selectedEdge, selectedShape, addToMostRecentlyUsedEdgeModification, mostRecentlyUsedEdgeModification } = useShape();

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

		const defaultValues = getDefaultValueForEdgeModification(type);

		const point1 = selectedShape.points.find((p) => p.id === selectedEdge.edgePoint1Id);
		const point2 = selectedShape.points.find((p) => p.id === selectedEdge.edgePoint2Id);
		if (!point1 || !point2) return;
		const points = generateEdgePoints(
			point1,
			point2,
			[{
				type: type,
				...defaultValues,
			}],
		);
		console.log(points);

		if (!selectedEdge.edgeId) { // If no edge id, create a new edge
			createEdge.mutate({
				shapeId: selectedShape.id,
				edgePoint1Id: selectedEdge.edgePoint1Id,
				edgePoint2Id: selectedEdge.edgePoint2Id,
				edgeModification: {
					edgeType: type,
					...defaultValues,
					points,
				},
			});

			addToMostRecentlyUsedEdgeModification(type);
		} else { // If edge id, update the existing edge
			updateEdge.mutate({
				edgeId: selectedEdge.edgeId,
				shapeId: selectedShape.id,
				edgeModificationId: selectedEdge.edgeModification.id,
				// When modification is changed, we want to reset to default values
				edgeModification: {
					edgeType: type,
					...defaultValues,
					points,
				}
			});

			addToMostRecentlyUsedEdgeModification(type);
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

					{mostRecentlyUsedEdgeModification.length > 0 && (
						<>
							<p className=" px-4 pt-4 font-semibold text-text-neutral-secondary text-xs">
								USED
							</p>
							<div className="grid grid-cols-2 gap-4 p-4">
								{mostRecentlyUsedEdgeModification.map((modification) => {
									const label = EdgeModificationList.find(item => item.id === modification)?.label ?? '';
									const icon = curveAndBumpIcons[modification as EdgeModificationType];

									return (
										<ShapeCard
											key={modification}
											id={modification}
											name={label}
											icon={icon}
											isActive={false} // We don't want to show the active state for the MRU modifications
											onClick={() => handleSelectModification(modification)}
										/>
									);
								})}
							</div>
						</>
					)}
					<p className=" px-4 pt-4 font-semibold text-text-neutral-secondary text-xs">
						GENERAL
					</p>
					<div className="grid grid-cols-2 gap-4 p-4">
						<ShapeCard
							id='BumpOut'
							name={"Bump-Out"}
							icon={<BumpOutIcon isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.BumpOut} />}
							onClick={() => handleSelectModification(EdgeModificationType.BumpOut)}
							isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.BumpOut}
						/>

						<ShapeCard
							id="BumpIn"
							name={"Bump-In"}
							icon={<BumpInIcon isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.BumpIn} />}
							onClick={() => handleSelectModification(EdgeModificationType.BumpIn)}
							isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.BumpIn}
						/>

						<ShapeCard
							id='BumpOutCurve'
							name={"Bump-Out Curve"}
							icon={<BumpOutCurveIcon isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.BumpOutCurve} />}
							onClick={() => handleSelectModification(EdgeModificationType.BumpOutCurve)}
							isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.BumpOutCurve}
						/>

						<ShapeCard
							id='BumpInCurve'
							name={"Bump-In Curve"}
							icon={<BumpInCurveIcon isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.BumpInCurve} />}
							onClick={() => handleSelectModification(EdgeModificationType.BumpInCurve)}
							isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.BumpInCurve}
						/>

						<ShapeCard
							id='FullCurve'
							name={"Full Curve"}
							icon={<FullCurveIcon isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.FullCurve} />}
							onClick={() => handleSelectModification(EdgeModificationType.FullCurve)}
							isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.FullCurve}
						/>

						<ShapeCard
							id='None'
							name={"None"}
							icon={<CurvesNoneIcon isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.None} />}
							onClick={handleDeleteEdgeModification}
							isActive={selectedEdge?.edgeModification?.type === EdgeModificationType.None}
						/>
					</div>
				</>
			)}
		</>
	);
};

export default CurveOverview;
