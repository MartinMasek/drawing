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
	const { selectedEdge, selectedCorner } = useShape();
	const [view, setView] = useState<ShapeSidePanelView>(
		cursorType === CursorTypes.Curves ? "generalCurves" : "generalCorners",
	);

	// Reset to general view when edge changes or when switching between modifications
	useEffect(() => {
		if (selectedEdge) {
			setView("generalCurves");
		}
	}, [selectedEdge?.edgeIndex, selectedEdge?.edgeModification?.id]);

	// Reset to general view when corner changes
	useEffect(() => {
		if (selectedCorner?.pointIndex) {
			setView("generalCorners");
		}
	}, [selectedCorner?.pointIndex]);

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
