import { type FC, useState } from "react";
import { SheetContent } from "../../ui/sheet";

import SidePanelAddMaterial from "./content/SidePanelAddMaterial";
import SidePanelDimensionsGeneral from "./content/SidePanelDimensionsGeneral";

const SidePanelDimensions: FC = () => {
	const [view, setView] = useState<"general" | "addMaterial">("general");

	const renderContent = () => {
		switch (view) {
			case "addMaterial":
				return <SidePanelAddMaterial setView={setView} />;
			default:
				return <SidePanelDimensionsGeneral setView={setView} />;
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

export default SidePanelDimensions;
