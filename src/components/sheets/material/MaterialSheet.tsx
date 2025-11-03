import { type FC, useState } from "react";
import { SheetContent } from "../../ui/sheet";

import EditMaterial from "./content/EditMaterial";
import MaterialOverview from "./content/MaterialOverview";
import AddMaterial from "./content/AddMaterial";

export type MaterialSheetView = "general" | "addMaterial" | "editMaterial";

const MaterialSheet: FC = () => {
	const [view, setView] = useState<MaterialSheetView>("general");

	const renderContent = () => {
		switch (view) {
			case "addMaterial":
				return <AddMaterial setView={setView} />;
			case "editMaterial":
				return <EditMaterial setView={setView} />;
			default:
				return <MaterialOverview setView={setView} />;
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

export default MaterialSheet;
