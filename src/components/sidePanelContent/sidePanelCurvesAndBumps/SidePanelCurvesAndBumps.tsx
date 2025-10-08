import { useEffect, useState, type FC } from "react"
import { SheetContent } from "../../ui/sheet"
import { useDrawing } from "~/components/header/context/DrawingContext"
import SidePanelCurvesAndBumpsGeneral from "./content/SidePanelCurvesAndBumpsGeneral"
import SidePanelCurvesAndBumpsEdit from "./content/SidePanelCurvesAndBumpsEdit"

const SidePanelCurvesAndBumps: FC = () => {
    const { isOpenSideDialog }  = useDrawing()
    const [view, setView] = useState<'general' | 'editCurves'>('general')
        
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        setView('general')
    }, [isOpenSideDialog])

      
    const renderContent = () => {
    switch (view) {
        case 'editCurves':
        return <SidePanelCurvesAndBumpsEdit setView={setView} />
        default:
        return <SidePanelCurvesAndBumpsGeneral setView={setView} />
    }
    }
    
    return (
        <SheetContent onInteractOutside={(e) => e.preventDefault()} className="gap-0">
            {renderContent()}
        </SheetContent>
    )
}

export default SidePanelCurvesAndBumps
