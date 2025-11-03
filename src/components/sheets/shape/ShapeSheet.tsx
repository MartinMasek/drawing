import { type FC, useEffect, useState } from "react";
import { SheetContent } from "../../ui/sheet";
import { useDrawing } from "~/components/context/DrawingContext";
import { CursorTypes } from "~/types/drawing";
import EditCorner from "./content/EditCorner";
import { useShape } from "~/components/context/ShapeContext";
import CornerOverview from "./content/CornerOverview";
import CurveOverview from "./content/CurveOverview";
import EditCurve from "./content/EditCurve";

export type ShapeSheetView =
	| "generalCurves"
	| "generalCorners"
	| "editCurves"
	| "editCorners";

const ShapeSheet: FC = () => {
	const { cursorType } = useDrawing();
	const { selectedEdge, selectedCorner } = useShape();
	const [view, setView] = useState<ShapeSheetView>(
		cursorType === CursorTypes.Curves ? "generalCurves" : "generalCorners",
	);

	// We need this useEffect to ensure that the view is updated when selected edge is changed
	useEffect(() => {
		if (selectedEdge?.edgeIndex) {
			setView("generalCurves");
		}
	}, [selectedEdge?.edgeIndex]);

	useEffect(() => {
		if (selectedCorner?.pointIndex) {
			setView("generalCorners");
		}
	}, [selectedCorner?.pointIndex]);

	const renderContent = () => {
		switch (view) {
			case "editCurves":
				return <EditCurve setView={setView} />;
			case "generalCorners":
				return <CornerOverview setView={setView} />;
			case "editCorners":
				return <EditCorner setView={setView} />;
			default:
				return <CurveOverview setView={setView} />;
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

export default ShapeSheet;
