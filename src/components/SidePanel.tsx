import type { FC } from "react";
import { useDrawing } from "./header/context/DrawingContext";
import { Sheet } from "./ui/sheet";
import SidePanelTriggerButton from "./drawing-old/SidePanelTriggerButton";
import { CursorTypes } from "./header/header/drawing-types";
import SidePanelCutouts from "./sidePanelContent/SidePanelCutouts";
import SidePanelDimensions from "./sidePanelContent/materialSidePanel/MaterialSidePanel";
import SidePanelEdges from "./sidePanelContent/SidePanelEdges";
import ShapeSidePanel from "./sidePanelContent/sidePanelShapes/ShapeSidePanel";

const SidePanel: FC = () => {
	const { isOpenSideDialog, setIsOpenSideDialog, cursorType } = useDrawing();

	return (
		<Sheet open={isOpenSideDialog} onOpenChange={setIsOpenSideDialog}>
			<SidePanelTriggerButton />
			{isOpenSideDialog && (
				<>
					{cursorType === CursorTypes.Dimesions && <SidePanelDimensions />}
					{(cursorType === CursorTypes.Curves ||
						cursorType === CursorTypes.Corners) && <ShapeSidePanel />}

					{cursorType === CursorTypes.Egdes && <SidePanelEdges />}
					{cursorType === CursorTypes.Cutouts && <SidePanelCutouts />}
				</>
			)}
			{/* Missing last 2 tabs, no designs for now */}
		</Sheet>
	);
};
export default SidePanel;
