import { type FC, useState } from "react";
import { SheetContent } from "../../ui/sheet";
import SidePanelCurvesAndBumpsEdit from "./content/SidePanelCurvesAndBumpsEdit";
import SidePanelCurvesAndBumpsGeneral from "./content/SidePanelCurvesAndBumpsGeneral";

const SidePanelCurvesAndBumps: FC = () => {
	const [view, setView] = useState<"general" | "editCurves">("general");

	const renderContent = () => {
		switch (view) {
			case "editCurves":
				return <SidePanelCurvesAndBumpsEdit setView={setView} />;
			default:
				return <SidePanelCurvesAndBumpsGeneral setView={setView} />;
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

export default SidePanelCurvesAndBumps;
