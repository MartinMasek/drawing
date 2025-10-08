import { useEffect, useState, type FC } from "react"
import { useDrawing } from "~/components/header/context/DrawingContext"
import SidePanelCornersEdit from "./content/SidePanelCornersEdit"
import SidePanelCornersGeneral from "./content/SidePanelCornersGeneral"
import { SheetContent } from "~/components/ui/sheet"

const SidePanelCorners: FC = () => {
    const { isOpenSideDialog }  = useDrawing()
    const [view, setView] = useState<'general' | 'editCorners'>('general')
        
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        setView('general')
    }, [isOpenSideDialog])

      
    const renderContent = () => {
    switch (view) {
        case 'editCorners':
        return <SidePanelCornersEdit setView={setView} />
        default:
        return <SidePanelCornersGeneral setView={setView} />
    }
    }
    
    return (
        <SheetContent onInteractOutside={(e) => e.preventDefault()} className="gap-0">
            {renderContent()}
        </SheetContent>
    )
}

export default SidePanelCorners
