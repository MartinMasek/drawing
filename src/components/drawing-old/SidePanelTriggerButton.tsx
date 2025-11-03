import {
	IconLayoutSidebarLeftExpand,
	IconLayoutSidebarRightExpand,
} from "@tabler/icons-react";
import type { FC } from "react";
import { useDrawing } from "../header/context/DrawingContext";
import { Icon } from "../header/header/Icon";
import { CursorTypes, DrawingTab } from "../header/header/drawing-types";
import { SheetTrigger } from "../ui/sheet";

const SidePanelTriggerButton: FC = () => {
	const { cursorType, isOpenSideDialog, setIsOpenSideDialog, activeTab } =
		useDrawing();
	if (
		cursorType === CursorTypes.Text ||
		cursorType === CursorTypes.Area ||
		cursorType === CursorTypes.Package
	)
		return null;

	// This will be probably removed, but right now we dont have designs for these tabs
	if (activeTab === DrawingTab.Layout || activeTab === DrawingTab.Quote) {
		return null;
	}

	return (
		<SheetTrigger>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
			<div
				onClick={() => setIsOpenSideDialog(!open)}
				className={`absolute top-3 z-50 flex h-[36px] cursor-pointer items-center gap-2 rounded-[10px] bg-white py-1 pr-3 pl-2 shadow-lg ${isOpenSideDialog ? "right-[349px]" : "right-3"
					}`}
			>
				<Icon size="md">
					{isOpenSideDialog ? (
						<IconLayoutSidebarLeftExpand />
					) : (
						<IconLayoutSidebarRightExpand />
					)}
				</Icon>

				{!isOpenSideDialog && (
					<p className="text-sm">
						{cursorType === CursorTypes.Dimesions && "Materials"}
						{cursorType === CursorTypes.Curves && "Curves & Bumps"}
						{cursorType === CursorTypes.Corners && "Corners"}
						{cursorType === CursorTypes.Edges && "Edges"}
						{cursorType === CursorTypes.Cutouts && "Cutout Parameters"}
					</p>
				)}
			</div>
		</SheetTrigger>
	);
};

export default SidePanelTriggerButton;
