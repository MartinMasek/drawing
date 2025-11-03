import type { FC } from "react";
import { SheetContent, SheetHeader, SheetTitle } from "~/components/ui/sheet";

const EdgeSheet: FC = () => {
	return (
		<SheetContent
			onInteractOutside={(e) => e.preventDefault()}
			className="gap-0"
		>
			<SheetHeader>
				<SheetTitle className="text-xl">Edges</SheetTitle>
			</SheetHeader>
			<div className="flex flex-col gap-4 p-4">
				<p className="text-gray-400 text-xs">
					Click on a edge in the canvas to see the available edge options and
					set up its parameters
				</p>
			</div>
		</SheetContent>
	);
};

export default EdgeSheet;
