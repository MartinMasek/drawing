import { useEffect, useState, type FC } from "react"
import { SheetContent } from "../../ui/sheet"
import { useDrawing } from "../../header/context/DrawingContext"
import SidePanelDimensionsGeneral from "./content/SidePanelDimensionsGeneral"
import SidePanelAddMaterial from "./content/SidePanelAddMaterial"

const SidePanelDimensions: FC = () => {
    const { isOpenSideDialog }  = useDrawing()
    const [view, setView] = useState<'general' | 'addMaterial'>('general')
        
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        setView('general')
      }, [isOpenSideDialog])

      
      const renderContent = () => {
        switch (view) {
          case 'addMaterial':
            return <SidePanelAddMaterial setView={setView} />
          default:
            return <SidePanelDimensionsGeneral setView={setView} />
        }
      }

    return (
        <SheetContent onInteractOutside={(e) => e.preventDefault()} className="gap-0">
          {renderContent()}
        </SheetContent>
      )
}

export default SidePanelDimensions
