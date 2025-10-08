import { IconPlus } from "@tabler/icons-react";
import type { FC } from "react";
import Button from "../header/header/Button";
import { Divider } from "../header/header/Divider";
import { Icon } from "../header/header/Icon";
import {
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "../ui/sheet";

const SidePanelDimensions: FC = () => {
	return (
		<SheetContent
			onInteractOutside={(e) => e.preventDefault()}
			className="gap-0"
		>
			<SheetHeader>
				<SheetTitle className="text-xl">Materials</SheetTitle>
			</SheetHeader>
			<div className="flex flex-col gap-4 p-4">
				<p className="text-gray-400 text-xs">
					Create and manage materials. You can pick a material before drawing or
					assign it to shapes later. Use one material for all shapes or
					different ones for each.
				</p>
				<Divider className="border-[0.5px]" />
				<p className="text-gray-400 text-sm">
					No unassigned shapes or materials created...
				</p>
			</div>
			<SheetFooter>
				<Button
					variant="contained"
					iconLeft={
						<Icon size="md">
							<IconPlus />
						</Icon>
					}
					color="primary"
				>
					Add material
				</Button>
			</SheetFooter>
		</SheetContent>
	);
};

export default SidePanelDimensions;
