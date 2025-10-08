import { useEffect, useState, type FC } from "react"
import { SheetContent } from "../../ui/sheet"
import { useDrawing } from "../../header/context/DrawingContext"
import SidePanelDimensionsGeneral from "./content/SidePanelDimensionsGeneral"
import SidePanelAddMaterial from "./content/SidePanelAddMaterial"
import { useShape } from "~/components/header/context/ShapeContext"
import { CursorTypes } from "~/components/header/header/drawing-types"

const SidePanelDimensions: FC = () => {
    const { isOpenSideDialog, setIsOpenSideDialog, cursorType }  = useDrawing()
    const { selectedShape }  = useShape()
    const [view, setView] = useState<'general' | 'addMaterial'>('general')
        
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        setView('general')
      }, [isOpenSideDialog])

      // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
      useEffect(()=>{
        // If clicked outside of shape, close side panel
        if(cursorType === CursorTypes.Dimesions && !selectedShape) {
          setIsOpenSideDialog(false)
        }

        // If shape is selected, open side panel
        if (cursorType === CursorTypes.Dimesions && selectedShape) {
          setIsOpenSideDialog(true)
        } 
      },[selectedShape])
      
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
