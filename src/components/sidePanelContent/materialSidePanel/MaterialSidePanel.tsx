import { type FC, useState } from "react";
import { SheetContent } from "../../ui/sheet";

import SidePanelAddMaterial from "./content/AddMaterial";
import SidePanelEditMaterial from "./content/EditMaterial";
import MaterialSidePanelGeneral from "./content/MaterialSidePanelGeneral";

export type MaterialSidePanelView = "general" | "addMaterial" | "editMaterial";

const MaterialSidePanel: FC = () => {
	const [view, setView] = useState<MaterialSidePanelView>("general");

	const renderContent = () => {
		switch (view) {
			case "addMaterial":
				return <SidePanelAddMaterial setView={setView} />;
			case "editMaterial":
				return <SidePanelEditMaterial setView={setView} />;
			default:
				return <MaterialSidePanelGeneral setView={setView} />;
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

export default MaterialSidePanel;
