import type { FC } from "react"
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet"

const SidePanelCurvesAndBumps: FC = () => {
    return(
        <SheetContent onInteractOutside={(e) => e.preventDefault()} className="gap-0">
            <SheetHeader>
                <SheetTitle className="text-xl">Curves & Bumps</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 p-4">
                <p className="text-gray-400 text-xs">Click on an edge or element in the canvas to see the available options and set up its parameters</p>
            </div>
        </SheetContent>
    )
}

export default SidePanelCurvesAndBumps
