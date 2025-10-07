
import type { FC } from "react"
import { Sheet } from "../ui/sheet"
import { useDrawing } from "../header/context/DrawingContext"
import SidePanelTriggerButton from "./SidePanelTriggerButton"
import SidePanelDimensions from "../sidePanelContent/SidePanelDimensions"
import { CursorTypes, DrawingTab } from "../header/header/drawing-types"
import SidePanelCurvesAndBumps from "../sidePanelContent/SidePanelCurvesAndBumps"
import SidePanelCorners from "../sidePanelContent/SidePanelCorners"
import SidePanelEdges from "../sidePanelContent/SidePanelEdges"
import SidePanelCutouts from "../sidePanelContent/SidePanelCutouts"


const SidePanel: FC = () => {
    const { isOpenSideDialog, setIsOpenSideDialog, activeTab, cursorType } = useDrawing()

    return(
        <Sheet open={isOpenSideDialog} onOpenChange={setIsOpenSideDialog}>
            <SidePanelTriggerButton />
            {activeTab === DrawingTab.Dimensions && <SidePanelDimensions />}
            {activeTab === DrawingTab.Shape && cursorType === CursorTypes.Curves && <SidePanelCurvesAndBumps />}
            {activeTab === DrawingTab.Shape && cursorType === CursorTypes.Corners && <SidePanelCorners />}
            {activeTab === DrawingTab.Edges && <SidePanelEdges />}
            {activeTab === DrawingTab.Cutouts && <SidePanelCutouts />}

            {/* Missing last 2 tabs, no designs for now */}
        </Sheet>
    )
} 
export default SidePanel