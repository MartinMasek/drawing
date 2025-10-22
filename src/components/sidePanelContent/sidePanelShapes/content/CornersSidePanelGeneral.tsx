import type { FC } from "react";
import { useShape } from "~/components/header/context/ShapeContext";
import { SheetHeader, SheetTitle } from "~/components/ui/sheet";
import ShapeCard from "../../components/ShapeCard";
import type { ShapeSidePanelView } from "../ShapeSidePanel";
import RadiusIcon from "~/components/icons/RadiusIcon";
import ClipIcon from "~/components/icons/ClipIcon";
import BumpOutCornerIcon from "~/components/icons/BumpOutCornerIcon";
import NotchIcon from "~/components/icons/NotchIcon";
import NoneCornerIcon from "~/components/icons/NoneCornerIcon";

interface CornersSidePanelGeneralProps {
	setView: (value: ShapeSidePanelView) => void;
}

const CornersSidePanelGeneral: FC<CornersSidePanelGeneralProps> = ({
	setView,
}) => {
	const { selectedPoint } = useShape();

	return (
		<>
			<SheetHeader>
				<SheetTitle className="text-xl">Corners</SheetTitle>
			</SheetHeader>
			{!selectedPoint ? (
				<div className="flex flex-col gap-4 p-4">
					<p className="text-gray-400 text-sm">
						Click on a corner in the canvas to set up its parameters
					</p>
				</div>
			) : (
				<>
					<p className=" px-4 pt-4 font-semibold text-text-neutral-secondary text-xs">
						GENERAL
					</p>
					<div className="grid grid-cols-2 gap-4 p-4">
						<ShapeCard
							id='Radius'
							name={"Radius"}
							icon={<RadiusIcon />}
							onClick={() => setView("editCorners")}
							isActive={false}
						/>

						<ShapeCard
							id='Clip'
							name={"Clip"}
							icon={<ClipIcon />}
							onClick={() => setView("editCorners")}
							isActive={false}
						/>

						<ShapeCard
							id='BumpOut'
							name={"Bump-Out"}
							icon={<BumpOutCornerIcon />}
							onClick={() => setView("editCorners")}
							isActive={false}
						/>

						<ShapeCard
							id='Notch'
							name={"Notch"}
							icon={<NotchIcon />}
							onClick={() => setView("editCorners")}
							isActive={false}
						/>

						<ShapeCard
							id='None'
							name={"None"}
							icon={<NoneCornerIcon />}
							isActive={true}
						/>
					</div>
				</>
			)}
		</>
	);
};

export default CornersSidePanelGeneral;
