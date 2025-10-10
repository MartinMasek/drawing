import { type FC, useState } from "react";
import { SheetContent } from "~/components/ui/sheet";
import SidePanelCornersEdit from "./content/SidePanelCornersEdit";
import SidePanelCornersGeneral from "./content/SidePanelCornersGeneral";

const SidePanelCorners: FC = () => {
	const [view, setView] = useState<"general" | "editCorners">("general");

	const renderContent = () => {
		switch (view) {
			case "editCorners":
				return <SidePanelCornersEdit setView={setView} />;
			default:
				return <SidePanelCornersGeneral setView={setView} />;
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

export default SidePanelCorners;
