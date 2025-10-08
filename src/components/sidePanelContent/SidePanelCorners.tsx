import type { FC } from "react";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

const SidePanelCorners: FC = () => {
	return (
		<SheetContent
			onInteractOutside={(e) => e.preventDefault()}
			className="gap-0"
		>
			<SheetHeader>
				<SheetTitle className="text-xl">Corners</SheetTitle>
			</SheetHeader>
			<div className="flex flex-col gap-4 p-4">
				<p className="text-gray-400 text-xs">
					Click on a corner in the canvas to set up its parameters
				</p>
			</div>
		</SheetContent>
	);
};

export default SidePanelCorners;
