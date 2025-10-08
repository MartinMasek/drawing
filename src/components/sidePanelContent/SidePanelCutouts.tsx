import type { FC } from "react";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

const SidePanelCutouts: FC = () => {
	return (
		<SheetContent
			onInteractOutside={(e) => e.preventDefault()}
			className="gap-0"
		>
			<SheetHeader>
				<SheetTitle className="text-xl">Cutout Parameters</SheetTitle>
			</SheetHeader>
			<div className="flex flex-col gap-4 p-4">
				<p className="text-gray-400 text-xs">
					Click within a shape to open the cutout menu. Use it to add a new
					cutout or click an existing one to adjust its parameters
				</p>
			</div>
		</SheetContent>
	);
};

export default SidePanelCutouts;
