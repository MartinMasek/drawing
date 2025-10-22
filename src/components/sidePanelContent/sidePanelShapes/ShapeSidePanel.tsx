import { type FC, useEffect, useState } from "react";
import { SheetContent } from "../../ui/sheet";
import CurvesAndBumpsSidePanelGeneral from "./content/CurvesAndBumpsSidePanelGeneral";
import EditCurvesAndBumps from "./content/EditCurvesAndBumps";
import CornersSidePanelGeneral from "./content/CornersSidePanelGeneral";
import { useDrawing } from "~/components/header/context/DrawingContext";
import { CursorTypes } from "~/components/header/header/drawing-types";
import EditCorner from "./content/EditCorner";
import { useShape } from "~/components/header/context/ShapeContext";

export type ShapeSidePanelView =
	| "generalCurves"
	| "generalCorners"
	| "editCurves"
	| "editCorners";

const ShapeSidePanel: FC = () => {
	const { cursorType } = useDrawing();
	const { selectedEdge } = useShape();
	const [view, setView] = useState<ShapeSidePanelView>(
		cursorType === CursorTypes.Curves ? "generalCurves" : "generalCorners",
	);

	// We need this useEffect to ensure that the view is updated when selected edge is changed
	useEffect(() => {
		if (selectedEdge?.edgeIndex) {
			setView("generalCurves");
		}
	}, [selectedEdge?.edgeIndex]);

	const renderContent = () => {
		switch (view) {
			case "editCurves":
				return <EditCurvesAndBumps setView={setView} />;
			case "generalCorners":
				return <CornersSidePanelGeneral setView={setView} />;
			case "editCorners":
				return <EditCorner setView={setView} />;
			default:
				return <CurvesAndBumpsSidePanelGeneral setView={setView} />;
		}
	};

	return (
		<SheetContent
			onInteractOutside={(e) => e.preventDefault()}
			className="gap-0"
		>
			{renderContent()}
		</SheetContent>
	);
};

export default ShapeSidePanel;
