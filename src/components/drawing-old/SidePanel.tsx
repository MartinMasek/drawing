import type { FC } from "react";
import { useDrawing } from "../header/context/DrawingContext";
import { CursorTypes } from "../header/header/drawing-types";
import SidePanelCorners from "../sidePanelContent/SidePanelCorners";
import SidePanelCurvesAndBumps from "../sidePanelContent/SidePanelCurvesAndBumps";
import SidePanelCutouts from "../sidePanelContent/SidePanelCutouts";
import SidePanelDimensions from "../sidePanelContent/SidePanelDimensions";
import SidePanelEdges from "../sidePanelContent/SidePanelEdges";
import { Sheet } from "../ui/sheet";
import SidePanelTriggerButton from "./SidePanelTriggerButton";

const SidePanel: FC = () => {
	const { isOpenSideDialog, setIsOpenSideDialog, cursorType } = useDrawing();

	return (
		<Sheet open={isOpenSideDialog} onOpenChange={setIsOpenSideDialog}>
			<SidePanelTriggerButton />
			{cursorType === CursorTypes.Dimesions && <SidePanelDimensions />}
			{cursorType === CursorTypes.Curves && <SidePanelCurvesAndBumps />}
			{cursorType === CursorTypes.Corners && <SidePanelCorners />}
			{cursorType === CursorTypes.Egdes && <SidePanelEdges />}
			{cursorType === CursorTypes.Cutouts && <SidePanelCutouts />}

			{/* Missing last 2 tabs, no designs for now */}
		</Sheet>
	);
};
export default SidePanel;
