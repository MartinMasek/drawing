
import type { FC } from "react"
import { Sheet } from "../ui/sheet"
import { useDrawing } from "../header/context/DrawingContext"
import SidePanelTriggerButton from "./SidePanelTriggerButton"
import SidePanelDimensions from "../sidePanelContent/SidePanelDimensions"
import { CursorTypes } from "../header/header/drawing-types"
import SidePanelCurvesAndBumps from "../sidePanelContent/SidePanelCurvesAndBumps"
import SidePanelCorners from "../sidePanelContent/SidePanelCorners"
import SidePanelEdges from "../sidePanelContent/SidePanelEdges"
import SidePanelCutouts from "../sidePanelContent/SidePanelCutouts"


const SidePanel: FC = () => {
    const { isOpenSideDialog, setIsOpenSideDialog, cursorType } = useDrawing()

    return(
        <Sheet open={isOpenSideDialog} onOpenChange={setIsOpenSideDialog}>
            <SidePanelTriggerButton />
            {cursorType === CursorTypes.Dimesions && <SidePanelDimensions />}
            {cursorType === CursorTypes.Curves && <SidePanelCurvesAndBumps />}
            {cursorType === CursorTypes.Corners && <SidePanelCorners />}
            {cursorType === CursorTypes.Egdes && <SidePanelEdges />}
            {cursorType === CursorTypes.Cutouts && <SidePanelCutouts />}

            {/* Missing last 2 tabs, no designs for now */}
        </Sheet>
    )
} 
export default SidePanel