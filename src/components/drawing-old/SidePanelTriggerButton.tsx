import type { FC } from "react";
import { SheetTrigger } from "../ui/sheet";
import { useDrawing } from "../header/context/DrawingContext";
import { IconLayoutSidebarLeftExpand, IconLayoutSidebarRightExpand } from "@tabler/icons-react";
import { Icon } from "../header/header/Icon";
import { CursorTypes, DrawingTab } from "../header/header/drawing-types";

const SidePanelTriggerButton: FC = () => {
    const { cursorType, isOpenSideDialog, setIsOpenSideDialog } = useDrawing()
    
      return (
        <SheetTrigger>
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            onClick={() => setIsOpenSideDialog(!open)}
            className={`absolute top-3 z-50 flex h-[36px] cursor-pointer items-center gap-2 rounded-[10px] py-1 pr-3 pl-2 shadow-lg transition-all duration-300 ${
              isOpenSideDialog ? "right-[396px]" : "right-3"
            }`}
          >
            <Icon size="md">
              {isOpenSideDialog ? <IconLayoutSidebarLeftExpand /> : <IconLayoutSidebarRightExpand />}
            </Icon>
      
            {!isOpenSideDialog && (
              <p className="text-sm">
                {cursorType === CursorTypes.Dimesions && "Materials"}
                {cursorType === CursorTypes.Curves && "Curves & Bumps"}
                {cursorType === CursorTypes.Corners && "Corners"}
                {cursorType === CursorTypes.Egdes && "Edges"}
                {cursorType === CursorTypes.Cutouts && "Cutout Parameters"}
              </p>
            )}
          </div>
        </SheetTrigger>
      );
}

export default SidePanelTriggerButton