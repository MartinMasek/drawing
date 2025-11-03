import type { FC } from "react";

import { Sheet } from "./ui/sheet";
import { CursorTypes } from "./header/header/drawing-types";
import MaterialSheet from "./sheets/material/MaterialSheet";
import CutoutSheet from "./sheets/cutout/CutoutSheet";
import ShapeSheet from "./sheets/shape/ShapeSheet";
import EdgeSheet from "./sheets/edge/EdgeSheet";
import SidePanelTriggerButton from "./SidePanelTriggerButton";
import { useDrawing } from "~/components/context/DrawingContext";

const SidePanel: FC = () => {
	const { isOpenSideDialog, setIsOpenSideDialog, cursorType } = useDrawing();

	return (
		<Sheet open={isOpenSideDialog} onOpenChange={setIsOpenSideDialog}>
			<SidePanelTriggerButton />
			{isOpenSideDialog && (
				<>
					{cursorType === CursorTypes.Dimesions && <MaterialSheet />}
					{cursorType === CursorTypes.Curves && <ShapeSheet />}
					{cursorType === CursorTypes.Corners && <ShapeSheet />}
					{cursorType === CursorTypes.Edges && <EdgeSheet />}
					{cursorType === CursorTypes.Cutouts && <CutoutSheet />}
				</>
			)}
		</Sheet>
	);
};
export default SidePanel;
