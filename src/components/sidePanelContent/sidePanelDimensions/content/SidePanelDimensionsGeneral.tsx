
import { IconPlus } from "@tabler/icons-react"
import type { FC } from "react"
import { useShape } from "~/components/header/context/ShapeContext"
import Button from "~/components/header/header/Button"
import { Divider } from "~/components/header/header/Divider"
import { Icon } from "~/components/header/header/Icon"
import  { SheetHeader, SheetTitle, SheetFooter } from "~/components/ui/sheet"


interface SidePanelDimensionsGeneralProps {
    setView: (value: 'general' | 'addMaterial') => void
}

const SidePanelDimensionsGeneral: FC<SidePanelDimensionsGeneralProps> = ({ setView }) => {
    const { selectedShape, allShapes, updateShape }  = useShape()

    const shapesWithoutMaterial = allShapes.filter(shape => !shape.materialId )

    const addMaterialToShape = (materialId: string) => {
        if (!selectedShape) return;
        updateShape(selectedShape.id, { materialId });
    }

    return(
        <>
            <SheetHeader>
                <SheetTitle className="text-xl">Materials</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 p-4">
                <p className="text-gray-400 text-xs">Create and manage materials. You can pick a material before drawing or assign it to shapes later. Use one material for all shapes or different ones for each.</p>
                <Divider className="border-[0.5px]"/>
                {shapesWithoutMaterial.length ? 
                    <div>
                    <div className="flex justify-between">
                        <p className="text-gray-400 text-sm">Unassigned:</p>
                        <p className="text-sm">{shapesWithoutMaterial.reduce((total, shape) => total + shape.area, 0)} SF</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-text-neutral-terciary text-xs">Apply Material</p>
                        <p className="text-text-neutral-terciary text-xs">{shapesWithoutMaterial.length} shape{shapesWithoutMaterial.length > 1 ? 's' : ''}</p>
                    </div>
                    </div>
                :
                    <p className="text-gray-400 text-sm">No unassigned shapes or materials created...</p>
                    
                }
            </div>

            {/* This is just for testing */}
            <Button variant="outlined" className="w-max" onClick={()=>addMaterialToShape('1')}>
                Add material ID 1 to selected shape
            </Button>


            <SheetFooter>
                <Button 
                    variant="contained" 
                    iconLeft={
                        <Icon size='md'>
                            <IconPlus />
                        </Icon>
                    }
                    color='primary' 
                    onClick={()=>setView('addMaterial')}
                    >
                        Add material
                </Button>
            </SheetFooter>
        </>
    )
}

export default SidePanelDimensionsGeneral