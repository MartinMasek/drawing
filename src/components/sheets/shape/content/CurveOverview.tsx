import type { FC, JSX } from "react";
import { useMemo } from "react";
import {
	EdgeModificationType,
} from "@prisma/client";
import { useUpdateEdgeModification } from "~/hooks/mutations/edges/useUpdateEdgeModification";
import { useShape } from "~/context/ShapeContext";
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
import { canAddModification } from "~/components/shape/edge/edgeValidation";
import { useDrawing } from "~/context/DrawingContext";

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
	// Mutations handle optimistic updates in onMutate
	const { designId } = useDrawing();

	const { selectedEdge, selectedShape, addToMostRecentlyUsedEdgeModification, mostRecentlyUsedEdgeModification } = useShape();

	const updateEdge = useUpdateEdgeModification(designId);
	const createEdge = useCreateEdgeModification(designId);
	const deleteEdgeModification = useDeleteEdgeModification(designId);

	// Memoize the current edge to avoid finding it multiple times
	const currentEdge = useMemo(() => {
		if (!selectedEdge || !selectedShape) return undefined;
		return selectedShape.edges.find(
			(e) =>
				e.point1Id === selectedEdge.edgePoint1Id &&
				e.point2Id === selectedEdge.edgePoint2Id,
		);
	}, [selectedEdge, selectedShape]);

	// Check if edge is at maximum capacity (2 modifications)
	const isEdgeFull = useMemo(() => {
		if (!selectedEdge || !currentEdge) return false;
		// If we're trying to add a new modification (id is null) and edge already has 2, it's full
		return (
			selectedEdge.edgeModification?.id === null &&
			currentEdge.edgeModifications.length >= 2
		);
	}, [selectedEdge, currentEdge]);

	// Check if Full Curve should be enabled
	// Enable only if: 1) first modification on edge, OR 2) editing existing modification with no other modifications
	const isFullCurveEnabled = useMemo(() => {
		if (!selectedEdge || !selectedShape) return false;
		if (!currentEdge) return true;

		const isNewModification = selectedEdge.edgeModification?.id === null;
		const modificationCount = currentEdge.edgeModifications.length;

		// Enable if it's a new modification and there are no existing modifications
		if (isNewModification && modificationCount === 0) return true;

		// Enable if we're editing an existing modification and there are no other modifications
		if (!isNewModification && modificationCount === 1) return true;

		return false;
	}, [selectedEdge, selectedShape, currentEdge]);

	const handleSelectModification = (type: EdgeModificationType) => {
		if (!selectedEdge) return;
		if (!selectedShape) return;
		if (!selectedEdge.edgeModification) return;

		if (selectedEdge.edgeModification.type === type) {
			setView("editCurves");
			return;
		}

		// Calculate default values with smart position selection based on existing modifications
		const defaultValues = getDefaultValueForEdgeModification(type, currentEdge);

		const point1 = selectedShape.points.find(
			(p) => p.id === selectedEdge.edgePoint1Id,
		);
		const point2 = selectedShape.points.find(
			(p) => p.id === selectedEdge.edgePoint2Id,
		);
		if (!point1 || !point2) return;
		const points = generateEdgePoints(point1, point2, [
			{
				type: type,
				...defaultValues,
			},
		]);

		if (!selectedEdge.edgeId) {
			// If no edge id, create a new edge
			// Validate that we can add a new modification (check the 2-modification limit)
			const validation = canAddModification(currentEdge, defaultValues.position);
			if (!validation.allowed) {
				console.warn(`Cannot add modification: ${validation.reason}`);
				return; // UI will show the warning message
			}

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
		} else {
			// If edge id, update the existing edge
			// When updating an existing modification, we're changing the type
			// If this is a new modification (id is null), validate
			if (selectedEdge.edgeModification.id === null) {
				const validation = canAddModification(currentEdge, defaultValues.position);
				if (!validation.allowed) {
					console.warn(`Cannot add modification: ${validation.reason}`);
					return; // UI will show the warning message
				}
			}

			updateEdge.mutate({
				edgeId: selectedEdge.edgeId,
				shapeId: selectedShape.id,
				edgeModificationId: selectedEdge.edgeModification.id,
				// When modification is changed, we want to reset to default values
				edgeModification: {
					edgeType: type,
					...defaultValues,
					points,
				},
			});

			addToMostRecentlyUsedEdgeModification(type);
		}

		// Defer view change to next tick to allow optimistic state updates to propagate
		setTimeout(() => setView("editCurves"), 0);
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
					{isEdgeFull && (
						<div className="mx-4 mt-4 rounded-md border border-amber-300 bg-amber-50 p-3">
							<p className="font-medium text-amber-800 text-sm">
								Maximum modifications reached
							</p>
							<p className="mt-1 text-amber-700 text-xs">
								This edge already has 2 modifications. Remove an existing
								modification to add a new one.
							</p>
						</div>
					)}

					{!isEdgeFull && mostRecentlyUsedEdgeModification.length > 0 && (
						<>
							<p className=" px-4 pt-4 font-semibold text-text-neutral-secondary text-xs">
								USED
							</p>
							<div className="grid grid-cols-2 gap-4 p-4">
								{mostRecentlyUsedEdgeModification.map((modification) => {
									const label =
										EdgeModificationList.find(
											(item) => item.id === modification,
										)?.label ?? "";
									const icon =
										curveAndBumpIcons[modification as EdgeModificationType];

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
					{!isEdgeFull && (
						<>
							<p className=" px-4 pt-4 font-semibold text-text-neutral-secondary text-xs">
								GENERAL
							</p>
							<div className="grid grid-cols-2 gap-4 p-4">
								<ShapeCard
									id="BumpOut"
									name={"Bump-Out"}
									icon={
										<BumpOutIcon
											isActive={
												selectedEdge?.edgeModification?.type ===
												EdgeModificationType.BumpOut
											}
										/>
									}
									onClick={() =>
										handleSelectModification(EdgeModificationType.BumpOut)
									}
									isActive={
										selectedEdge?.edgeModification?.type ===
										EdgeModificationType.BumpOut
									}
								/>

								<ShapeCard
									id="BumpIn"
									name={"Bump-In"}
									icon={
										<BumpInIcon
											isActive={
												selectedEdge?.edgeModification?.type ===
												EdgeModificationType.BumpIn
											}
										/>
									}
									onClick={() =>
										handleSelectModification(EdgeModificationType.BumpIn)
									}
									isActive={
										selectedEdge?.edgeModification?.type ===
										EdgeModificationType.BumpIn
									}
								/>

								<ShapeCard
									id="BumpOutCurve"
									name={"Bump-Out Curve"}
									icon={
										<BumpOutCurveIcon
											isActive={
												selectedEdge?.edgeModification?.type ===
												EdgeModificationType.BumpOutCurve
											}
										/>
									}
									onClick={() =>
										handleSelectModification(EdgeModificationType.BumpOutCurve)
									}
									isActive={
										selectedEdge?.edgeModification?.type ===
										EdgeModificationType.BumpOutCurve
									}
								/>

								<ShapeCard
									id="BumpInCurve"
									name={"Bump-In Curve"}
									icon={
										<BumpInCurveIcon
											isActive={
												selectedEdge?.edgeModification?.type ===
												EdgeModificationType.BumpInCurve
											}
										/>
									}
									onClick={() =>
										handleSelectModification(EdgeModificationType.BumpInCurve)
									}
									isActive={
										selectedEdge?.edgeModification?.type ===
										EdgeModificationType.BumpInCurve
									}
								/>

								<ShapeCard
									id="FullCurve"
									name={"Full Curve"}
									icon={
										<FullCurveIcon
											isActive={
												selectedEdge?.edgeModification?.type ===
												EdgeModificationType.FullCurve
											}
										/>
									}
									onClick={
										isFullCurveEnabled
											? () =>
												handleSelectModification(
													EdgeModificationType.FullCurve,
												)
											: undefined
									}
									isActive={
										selectedEdge?.edgeModification?.type ===
										EdgeModificationType.FullCurve
									}
									disabled={!isFullCurveEnabled}
								/>

								<ShapeCard
									id="None"
									name={"None"}
									icon={
										<CurvesNoneIcon
											isActive={
												selectedEdge?.edgeModification?.type ===
												EdgeModificationType.None
											}
										/>
									}
									onClick={handleDeleteEdgeModification}
									isActive={
										selectedEdge?.edgeModification?.type ===
										EdgeModificationType.None
									}
								/>
							</div>
						</>
					)}
				</>
			)}
		</>
	);
};

export default CurveOverview;
