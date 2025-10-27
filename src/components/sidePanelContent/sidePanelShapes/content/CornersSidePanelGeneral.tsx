import type { FC, JSX } from "react";
import { useShape } from "~/components/header/context/ShapeContext";
import { SheetHeader, SheetTitle } from "~/components/ui/sheet";
import ShapeCard from "../../components/ShapeCard";
import type { ShapeSidePanelView } from "../ShapeSidePanel";
import RadiusIcon from "~/components/icons/RadiusIcon";
import ClipIcon from "~/components/icons/ClipIcon";
import BumpOutCornerIcon from "~/components/icons/BumpOutCornerIcon";
import NotchIcon from "~/components/icons/NotchIcon";
import NoneCornerIcon from "~/components/icons/NoneCornerIcon";
import { CornerType } from "@prisma/client";
import useCreateCornerModification from "~/hooks/mutations/corners/useCreateCornerModification";
import useUpdateCornerModification from "~/hooks/mutations/corners/useUpdateCornerModification";
import { useRouter } from "next/router";
import useDeleteCornerModification from "~/hooks/mutations/corners/useDeleteCornerModification";
import { getDefaultValueForCornerModification } from "~/types/defaultValues";
import { CornerModificationList, EdgeModificationList } from "~/types/drawing";

interface CornersSidePanelGeneralProps {
	setView: (value: ShapeSidePanelView) => void;
}

const cornerIcons: Record<CornerType, JSX.Element> = {
	[CornerType.Radius]: <RadiusIcon isActive={false} />,
	[CornerType.Clip]: <ClipIcon isActive={false} />,
	[CornerType.BumpOut]: <BumpOutCornerIcon isActive={false} />,
	[CornerType.Notch]: <NotchIcon isActive={false} />,
	[CornerType.None]: <NoneCornerIcon isActive={false} />,
};

const CornersSidePanelGeneral: FC<CornersSidePanelGeneralProps> = ({
	setView,
}) => {
	const router = useRouter();
	const idParam = router.query.id;
	const designId = Array.isArray(idParam) ? idParam[0] : idParam;
	const { selectedCorner, selectedShape, addToMostRecentlyUsedCornerModification, mostRecentlyUsedCornerModification } = useShape();
	const createCornerModification = useCreateCornerModification(designId);
	const updateCornerModification = useUpdateCornerModification(designId);
	const deleteCornerModification = useDeleteCornerModification(designId);

	const handleSelectModification = (type: CornerType) => {
		if (!selectedCorner) return;
		if (!selectedShape) return;

		if (selectedCorner.type === type) {
			setView("editCorners");
			return;
		}
		const defaultValues = getDefaultValueForCornerModification(type);

		if (!selectedCorner.cornerId) {
			createCornerModification.mutate({
				shapeId: selectedShape.id,
				pointId: selectedCorner.pointId,
				type: type,
				...defaultValues,
			});
			addToMostRecentlyUsedCornerModification(type);
		} else {
			// When we change the type of the corner, we want to set default values
			updateCornerModification.mutate({
				cornerId: selectedCorner.cornerId,
				type: type,
				...defaultValues,
			});
			addToMostRecentlyUsedCornerModification(type);
		}

		setView("editCorners");
	};

	const handleDeleteCornerModification = () => {
		if (!selectedCorner?.cornerId) return;
		if (!selectedShape) return;

		deleteCornerModification.mutate({
			cornerId: selectedCorner.cornerId,
		});
	};

	return (
		<>
			<SheetHeader>
				<SheetTitle className="text-xl">Corners</SheetTitle>
			</SheetHeader>
			{!selectedCorner ? (
				<div className="flex flex-col gap-4 p-4">
					<p className="text-gray-400 text-sm">
						Click on a corner in the canvas to set up its parameters
					</p>
				</div>
			) : (
				<>
					{mostRecentlyUsedCornerModification.length > 0 && (
						<>
							<p className=" px-4 pt-4 font-semibold text-text-neutral-secondary text-xs">
								USED
							</p>
							<div className="grid grid-cols-2 gap-4 p-4">
								{mostRecentlyUsedCornerModification.map((modification) => {
									const label = CornerModificationList.find(item => item.id === modification)?.label ?? '';
									const icon = cornerIcons[modification as CornerType];

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
							id='Radius'
							name={"Radius"}
							icon={<RadiusIcon isActive={selectedCorner?.type === CornerType.Radius} />}
							onClick={() => handleSelectModification(CornerType.Radius)}
							isActive={selectedCorner?.type === CornerType.Radius}
						/>

						<ShapeCard
							id='Clip'
							name={"Clip"}
							icon={<ClipIcon isActive={selectedCorner?.type === CornerType.Clip} />}
							onClick={() => handleSelectModification(CornerType.Clip)}
							isActive={selectedCorner?.type === CornerType.Clip}
						/>

						<ShapeCard
							id='BumpOut'
							name={"Bump-Out"}
							icon={<BumpOutCornerIcon isActive={selectedCorner?.type === CornerType.BumpOut} />}
							onClick={() => handleSelectModification(CornerType.BumpOut)}
							isActive={selectedCorner?.type === CornerType.BumpOut}
						/>

						<ShapeCard
							id='Notch'
							name={"Notch"}
							icon={<NotchIcon isActive={selectedCorner?.type === CornerType.Notch} />}
							onClick={() => handleSelectModification(CornerType.Notch)}
							isActive={selectedCorner?.type === CornerType.Notch}
						/>

						<ShapeCard
							id='None'
							name={"None"}
							icon={<NoneCornerIcon isActive={selectedCorner?.type === CornerType.None} />}
							onClick={handleDeleteCornerModification}
							isActive={selectedCorner?.type === CornerType.None}
						/>
					</div>
				</>
			)}
		</>
	);
};

export default CornersSidePanelGeneral;
